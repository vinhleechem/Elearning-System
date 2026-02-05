package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.CartItemResponse;
import org.example.elearning.dto.response.CartResponse;
import org.example.elearning.entity.CartEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceConflictException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.CartRepository;
import org.example.elearning.service.CartService;
import org.example.elearning.service.CourseService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.EnrollmentService;
import org.example.elearning.service.PromotionService;
import org.example.elearning.mapper.CartItemMapper;
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
        
        UserService userService;
        CourseService courseService;
        EnrollmentService enrollmentService;
        PromotionService promotionService;
        CartItemMapper cartItemMapper;

        @Override
        @Transactional
        public CartResponse getMyCart() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = userService.getUserByEmail(email);

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
                UserEntity user = userService.getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseGet(() -> createCartForUser(user));

                CourseEntity course = courseService.getCourseEntityById(courseId);

                if (enrollmentService.isEnrolled(courseId)) {
                        throw new ResourceConflictException(ErrorCode.COURSE_ALREADY_ENROLLED.getMessage());
                }

                if (cart.getCourses().contains(course)) {
                        throw new ResourceConflictException(ErrorCode.COURSE_ALREADY_IN_CART.getMessage());
                }

                cart.getCourses().add(course);
                cartRepository.save(cart);

                return getMyCart();
        }

        @Override
        @Transactional
        public void removeFromCart(Long courseId) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = userService.getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                ErrorCode.CART_NOT_FOUND.getMessage()));

                CourseEntity course = courseService.getCourseEntityById(courseId);

                if (!cart.getCourses().contains(course)) {
                        throw new ResourceNotFoundException(ErrorCode.CART_ITEM_NOT_FOUND.getMessage());
                }

                cart.getCourses().remove(course);
                cartRepository.save(cart);
        }

        @Override
        @Transactional
        public void clearCart() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = userService.getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CART_NOT_FOUND.getMessage()));

                cart.getCourses().clear();
                cartRepository.save(cart);
        }


        private CartEntity createCartForUser(UserEntity user) {
                CartEntity cart = CartEntity.builder()
                                .user(user)
                                .build();
                return cartRepository.save(cart);
        }

        private CartItemResponse mapToCartItemResponse(CourseEntity course) {
                CartItemResponse response = cartItemMapper.toResponse(course);
                promotionService.applyBestPromotionToCartItem(response, course);
                return response;
        }
}
