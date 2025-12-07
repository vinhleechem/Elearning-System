package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.CartItemResponse;
import org.example.elearning.dto.response.CartResponse;
import org.example.elearning.entity.CartEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
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
        CourseRepository courseRepository;
        UserRepository userRepository;
        EnrollmentRepository enrollmentRepository;

        @Override
        public CartResponse getMyCart() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseGet(() -> createCartForUser(user));

                List<CartItemResponse> itemResponses = cart.getCourses().stream()
                                .filter(course -> !course.isDeleted())
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
                if (cart.getCourses().contains(course)) {
                        throw new BusinessException("Khóa học đã có trong giỏ hàng");
                }

                cart.getCourses().add(course);
                cartRepository.save(cart);

                return getMyCart();
        }

        @Override
        @Transactional
        public void removeFromCart(Long courseId) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giỏ hàng"));

                CourseEntity course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));

                if (!cart.getCourses().contains(course)) {
                        throw new ResourceNotFoundException("Khóa học không có trong giỏ hàng");
                }

                cart.getCourses().remove(course);
                cartRepository.save(cart);
        }

        @Override
        @Transactional
        public void clearCart() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giỏ hàng"));

                cart.getCourses().clear();
                cartRepository.save(cart);
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

        private CartItemResponse mapToCartItemResponse(CourseEntity course) {
                return CartItemResponse.builder()
                                .courseId(course.getCourseId())
                                .courseTitle(course.getTitle())
                                .courseImage(course.getThumbnailUrl())
                                .price(course.getPrice())
                                .discountPrice(course.getDiscountPrice())
                                .build();
        }
}
