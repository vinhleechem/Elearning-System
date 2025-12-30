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
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.CartRepository;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.repository.PromotionRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.CartService;
import org.example.elearning.entity.PromotionEntity;
import org.example.elearning.entity.PromotionRuleEntity;
import org.example.elearning.enums.PromotionRuleType;
import org.example.elearning.enums.DiscountType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
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
        PromotionRepository promotionRepository;

        @Override
        @Transactional(readOnly = false)
        public CartResponse getMyCart() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                UserEntity user = getUserByEmail(email);

                CartEntity cart = cartRepository.findByUser(user)
                                .orElseGet(() -> createCartForUser(user));

                List<PromotionEntity> activePromotions = promotionRepository.findActivePromotions(LocalDateTime.now());

                List<CartItemResponse> itemResponses = cart.getCourses().stream()
                                .filter(course -> !course.isDeleted())
                                .map(course -> mapToCartItemResponse(course, activePromotions))
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
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                ErrorCode.COURSE_NOT_FOUND.getMessage()));

                // Kiểm tra đã enroll chưa
                if (enrollmentRepository.existsByUserAndCourse(user, course)) {
                        throw new BusinessException(ErrorCode.COURSE_ALREADY_ENROLLED.getMessage());
                }

                // Kiểm tra đã có trong giỏ hàng chưa
                if (cart.getCourses().contains(course)) {
                        throw new BusinessException(ErrorCode.COURSE_ALREADY_IN_CART.getMessage());
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
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                ErrorCode.PERMISSION_NOT_FOUND.getMessage()));

                CourseEntity course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                ErrorCode.COURSE_NOT_FOUND.getMessage()));

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

        private CartItemResponse mapToCartItemResponse(CourseEntity course, List<PromotionEntity> activePromotions) {
                CartItemResponse response = CartItemResponse.builder()
                                .courseId(course.getCourseId())
                                .courseTitle(course.getTitle())
                                .courseImage(course.getThumbnailUrl())
                                .price(course.getPrice())
                                .discountPrice(course.getDiscountPrice())
                                .build();
                
                applyBestPromotion(response, course, activePromotions);
                return response;
        }

        private void applyBestPromotion(CartItemResponse response, CourseEntity course, List<PromotionEntity> activePromotions) {
                if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) == 0) {
                        return;
                }

                BigDecimal bestDiscountAmount = BigDecimal.ZERO;
                PromotionEntity bestPromotion = null;

                for (PromotionEntity promotion : activePromotions) {
                        for (PromotionRuleEntity rule : promotion.getRules()) {
                                if (isRuleApplicable(rule, course)) {
                                        BigDecimal discountAmount = calculateDiscountAmount(rule, course.getPrice());
                                        if (discountAmount.compareTo(bestDiscountAmount) > 0) {
                                                bestDiscountAmount = discountAmount;
                                                bestPromotion = promotion;
                                        }
                                }
                        }
                }

                if (bestPromotion != null) {
                        BigDecimal finalPrice = course.getPrice().subtract(bestDiscountAmount);
                        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) finalPrice = BigDecimal.ZERO;
                        response.setDiscountPrice(finalPrice);
                }
        }

        private boolean isRuleApplicable(PromotionRuleEntity rule, CourseEntity course) {
                if (rule.getRuleType() == PromotionRuleType.ALL) {
                        return true;
                }
                if (rule.getRuleType() == PromotionRuleType.COURSE) {
                        return rule.getTargetId() != null && rule.getTargetId().equals(course.getCourseId());
                }
                if (rule.getRuleType() == PromotionRuleType.CATEGORY) {
                        return rule.getTargetId() != null && rule.getTargetId().equals(course.getCategory().getId());
                }
                return false;
        }

        private BigDecimal calculateDiscountAmount(PromotionRuleEntity rule, BigDecimal price) {
                if (rule.getDiscountType() == DiscountType.FIXED) {
                        return rule.getDiscountValue();
                } else {
                        BigDecimal discount = price.multiply(rule.getDiscountValue().divide(new BigDecimal(100)));
                        if (rule.getMaxDiscountAmount() != null && discount.compareTo(rule.getMaxDiscountAmount()) > 0) {
                                return rule.getMaxDiscountAmount();
                        }
                        return discount;
                }
        }
}
