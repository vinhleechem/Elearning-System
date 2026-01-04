package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.CreateOrderRequest;
import org.example.elearning.dto.response.OrderItemResponse;
import org.example.elearning.dto.response.OrderResponse;
import org.example.elearning.entity.*;
import org.example.elearning.enums.OrderStatus;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.OrderRepository;
import org.example.elearning.repository.OrderItemRepository;
import org.example.elearning.service.OrderService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.CourseService;
import org.example.elearning.service.EnrollmentService;
import org.example.elearning.service.NotificationService;
import org.example.elearning.mapper.OrderMapper;
import org.example.elearning.dto.request.NotificationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    // ✅ Only own repositories
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;
    
    // ✅ Use services for other entities
    UserService userService;
    CourseService courseService;
    EnrollmentService enrollmentService;
    NotificationService notificationService;
    OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        // Lấy danh sách khóa học
        List<CourseEntity> courses = courseService.getCourseEntitiesByIds(request.getCourseIds());

        if (courses.isEmpty()) {
            throw new BusinessException(ErrorCode.COURSE_NOT_FOUND_LIST.getMessage());
        }

        // Kiểm tra đã enroll chưa
        for (CourseEntity course : courses) {
            if (enrollmentService.existsByUserAndCourse(user, course)) {
                throw new BusinessException(ErrorCode.COURSE_ALREADY_ENROLLED.getMessage());
            }
        }

        // Tính tổng tiền (giá gốc, discount sẽ tính sau từ promotions)
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CourseEntity course : courses) {
            BigDecimal price = course.getPrice();
            totalAmount = totalAmount.add(price);
        }

        // --- CHECK REUSE: Check for reusable PENDING order ---
        List<OrderEntity> oldPendingOrders = orderRepository.findByUserAndStatus(user, OrderStatus.PENDING);
        Set<Long> requestCourseIds = new HashSet<>(request.getCourseIds());

        for (OrderEntity oldOrder : oldPendingOrders) {
            List<OrderItemEntity> oldItems = orderItemRepository.findByOrder(oldOrder);
            Set<Long> oldCourseIds = oldItems.stream()
                    .map(item -> item.getCourse().getCourseId())
                    .collect(Collectors.toSet());

            if (oldCourseIds.equals(requestCourseIds)) {
                // Found reusable order. Cancel all OTHERS.
                for (OrderEntity other : oldPendingOrders) {
                    if (!other.getOrderId().equals(oldOrder.getOrderId())) {
                        other.setStatus(OrderStatus.CANCELLED);
                        orderRepository.save(other);
                    }
                }
                return mapToOrderResponse(oldOrder, oldItems);
            }
        }

        // If no reusable order found, cancel ALL old pending orders
        if (!oldPendingOrders.isEmpty()) {
            for (OrderEntity oldOrder : oldPendingOrders) {
                oldOrder.setStatus(OrderStatus.CANCELLED);
            }
            orderRepository.saveAll(oldPendingOrders);
        }
        // -----------------------------------------------------------------------------

        // Tạo order mới
        OrderEntity order = OrderEntity.builder()
                .user(user)
                .totalAmount(totalAmount)
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .build();

        order = orderRepository.save(order);

        // Tạo order items
        List<OrderItemEntity> orderItems = new ArrayList<>();
        for (CourseEntity course : courses) {
            BigDecimal price = course.getPrice();

            OrderItemEntity orderItem = OrderItemEntity.builder()
                    .order(order)
                    .course(course)
                    .price(price)
                    .discountPrice(price)  // Sẽ update sau khi apply promotions
                    .finalPrice(price)     // Sẽ update sau khi apply promotions
                    .build();

            orderItems.add(orderItemRepository.save(orderItem));
        }

        // Send notification to all admins about new order
        sendNewOrderNotification(order, user);

        return mapToOrderResponse(order, orderItems);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND.getMessage()));

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException(ErrorCode.ORDER_UNAUTHORIZED.getMessage());
        }

        List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);

        return mapToOrderResponse(order, orderItems);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        Page<OrderEntity> orders = orderRepository.findByUser(user, pageable);

        return orders.map(order -> {
            List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);
            return mapToOrderResponse(order, orderItems);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(String search, OrderStatus status, LocalDateTime fromDate,
            LocalDateTime toDate, Pageable pageable) {
        Specification<OrderEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                try {
                    Long orderId = Long.parseLong(search);
                    predicates.add(cb.equal(root.get("orderId"), orderId));
                } catch (NumberFormatException e) {
                    predicates.add(cb.like(cb.lower(root.get("user").get("email")), "%" + search.toLowerCase() + "%"));
                }
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }

            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<OrderEntity> orders = orderRepository.findAll(spec, pageable);
        return orders.map(order -> {
            List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);
            return mapToOrderResponse(order, orderItems);
        });
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND.getMessage()));

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException(ErrorCode.ORDER_CANNOT_CANCEL.getMessage());
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Chỉ có thể hủy đơn hàng đang chờ xử lý");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderEntity getOrderEntityById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND.getMessage()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemEntity> getOrderItemsByOrder(OrderEntity order) {
        return orderItemRepository.findByOrder(order);
    }

    @Override
    @Transactional
    public void updateOrderStatus(OrderEntity order, OrderStatus status) {
        order.setStatus(status);
        orderRepository.save(order);
    }

    private void sendNewOrderNotification(OrderEntity order, UserEntity user) {
        // Get all admins
        List<UserEntity> admins = userService.findAllAdmins();
        
        for (UserEntity admin : admins) {
            NotificationRequest notification = NotificationRequest.builder()
                    .title("Đơn hàng mới")
                    .message(String.format("%s đã đặt hàng với tổng giá trị %s VNĐ", 
                            user.getFullName(), 
                            order.getFinalAmount()))
                    .type("SYSTEM")
                    .userId(admin.getUserId())
                    .link("/admin/orders")
                    .build();
            
            notificationService.createAndSendNotification(notification);
        }
    }

    private OrderResponse mapToOrderResponse(OrderEntity order, List<OrderItemEntity> orderItems) {
        return orderMapper.toOrderResponse(order, orderItems);
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItemEntity orderItem) {
        return orderMapper.toOrderItemResponse(orderItem);
    }
}
