package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.CartItemResponse;
import org.example.elearning.dto.response.CartResponse;
import org.example.elearning.entity.CartEntity;
import org.example.elearning.entity.CartItemEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.CartItemRepository;
import org.example.elearning.repository.CartRepository;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.CartService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
        CartRepository cartRepository;
        CartItemRepository cartItemRepository;
        CourseRepository courseRepository;
        UserRepository userRepository;
        EnrollmentRepository enrollmentRepository;

        @Override
        public CartResponse getMyCart() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseGet(() -> createCartForUser(user));

                List<CartItemEntity> cartItems = cartItemRepository.findByCart(cart);

                List<CartItemResponse> itemResponses = cartItems.stream()
                                .map(this::mapToCartItemResponse)
                                .collect(Collectors.toList());

                BigDecimal totalAmount = itemResponses.stream()
                                .map(item -> item.getDiscountPrice() != null ? item.getDiscountPrice()
                                                : item.getPrice())
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                return CartResponse.builder()
                                .cartId(cart.getCartId())
                                .items(itemResponses)
                                .totalAmount(totalAmount)
                                .build();
        }

        @Override
        @Transactional
        public CartResponse addToCart(Long courseId) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseGet(() -> createCartForUser(user));

                CourseEntity course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));

                // Kiểm tra đã enroll chưa
                if (enrollmentRepository.existsByUserAndCourse(user, course)) {
                        throw new BusinessException("Bạn đã đăng ký khóa học này rồi");
                }

                // Kiểm tra đã có trong giỏ hàng chưa
                if (cartItemRepository.existsByCartAndCourse(cart, course)) {
                        throw new BusinessException("Khóa học đã có trong giỏ hàng");
                }

                CartItemEntity cartItem = CartItemEntity.builder()
                                .cart(cart)
                                .course(course)
                                .build();

                cartItemRepository.save(cartItem);

                return getMyCart();
        }

        @Override
        @Transactional
        public void removeFromCart(Long cartItemId) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = getUserByEmail(email);

                CartItemEntity cartItem = cartItemRepository.findById(cartItemId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy item trong giỏ hàng"));

                if (!cartItem.getCart().getUser().getUserId().equals(user.getUserId())) {
                        throw new BusinessException("Bạn không có quyền xóa item này");
                }

                cartItemRepository.delete(cartItem);
        }

        @Override
        @Transactional
        public void clearCart() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giỏ hàng"));

                cartItemRepository.deleteByCart(cart);
        }

        private UserEntity getUserByEmail(String email) {
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        }

        private CartEntity createCartForUser(UserEntity user) {
                CartEntity cart = CartEntity.builder()
                                .user(user)
                                .build();
                return cartRepository.save(cart);
        }

        private CartItemResponse mapToCartItemResponse(CartItemEntity cartItem) {
                CourseEntity course = cartItem.getCourse();
                return CartItemResponse.builder()
                                .cartItemId(cartItem.getCartItemId())
                                .courseId(course.getCourseId())
                                .courseTitle(course.getTitle())
                                .courseImage(course.getThumbnailUrl())
                                .price(course.getPrice())
                                .discountPrice(course.getDiscountPrice())
                                .build();
        }
}
