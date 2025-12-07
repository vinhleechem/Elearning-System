package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.CreateOrderRequest;
import org.example.elearning.dto.response.OrderItemResponse;
import org.example.elearning.dto.response.OrderResponse;
import org.example.elearning.entity.*;
import org.example.elearning.enums.OrderStatus;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.*;
import org.example.elearning.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;
    CourseRepository courseRepository;
    UserRepository userRepository;
    EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        // Lấy danh sách khóa học
        List<CourseEntity> courses = courseRepository.findAllById(request.getCourseIds());

        if (courses.isEmpty()) {
            throw new BusinessException("Không tìm thấy khóa học nào");
        }

        // Kiểm tra đã enroll chưa
        for (CourseEntity course : courses) {
            if (enrollmentRepository.existsByUserAndCourse(user, course)) {
                throw new BusinessException("Bạn đã đăng ký khóa học: " + course.getTitle());
            }
        }

        // Tính tổng tiền
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItemEntity> orderItems = new ArrayList<>();

        for (CourseEntity course : courses) {
            BigDecimal price = course.getPrice();
            BigDecimal discountPrice = course.getDiscountPrice();
            BigDecimal finalPrice = discountPrice != null ? discountPrice : price;

            totalAmount = totalAmount.add(finalPrice);
        }

        // Tạo order
        OrderEntity order = OrderEntity.builder()
                .user(user)
                .totalAmount(totalAmount)
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .build();

        order = orderRepository.save(order);

        // Tạo order items
        for (CourseEntity course : courses) {
            BigDecimal price = course.getPrice();
            BigDecimal discountPrice = course.getDiscountPrice();
            BigDecimal finalPrice = discountPrice != null ? discountPrice : price;

            OrderItemEntity orderItem = OrderItemEntity.builder()
                    .order(order)
                    .course(course)
                    .price(price)
                    .discountPrice(discountPrice)
                    .finalPrice(finalPrice)
                    .build();

            orderItems.add(orderItemRepository.save(orderItem));
        }

        return mapToOrderResponse(order, orderItems);
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException("Bạn không có quyền truy cập đơn hàng này");
        }

        List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);

        return mapToOrderResponse(order, orderItems);
    }

    @Override
    public Page<OrderResponse> getMyOrders(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        Page<OrderEntity> orders = orderRepository.findByUser(user, pageable);

        return orders.map(order -> {
            List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);
            return mapToOrderResponse(order, orderItems);
        });
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException("Bạn không có quyền hủy đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Chỉ có thể hủy đơn hàng đang chờ xử lý");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    private OrderResponse mapToOrderResponse(OrderEntity order, List<OrderItemEntity> orderItems) {
        List<OrderItemResponse> itemResponses = orderItems.stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItemEntity orderItem) {
        CourseEntity course = orderItem.getCourse();
        return OrderItemResponse.builder()
                .orderItemId(orderItem.getOrderItemId())
                .courseId(course.getCourseId())
                .courseTitle(course.getTitle())
                .courseImage(course.getThumbnailUrl())
                .price(orderItem.getPrice())
                .discountPrice(orderItem.getDiscountPrice())
                .finalPrice(orderItem.getFinalPrice())
                .build();
    }
}
