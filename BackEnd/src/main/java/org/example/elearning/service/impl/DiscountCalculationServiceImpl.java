package org.example.elearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.ApplyDiscountRequest;
import org.example.elearning.dto.response.DiscountCalculationResponse;
import org.example.elearning.entity.*;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.OrderDiscountType;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.*;
import org.example.elearning.service.DiscountCalculationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountCalculationServiceImpl implements DiscountCalculationService {

    private final PromotionRepository promotionRepository;
    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final CourseRepository courseRepository;
    private final OrderDiscountRepository orderDiscountRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository; // Added OrderRepository


    private ApplyDiscountRequest buildRequestFromOrder(OrderEntity order) {
        ApplyDiscountRequest request = new ApplyDiscountRequest();
        request.setUserId(order.getUser().getUserId());

        List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);
        
        List<ApplyDiscountRequest.CartItemRequest> cartItems = orderItems.stream()
                .map(item -> {
                    ApplyDiscountRequest.CartItemRequest cartItem = new ApplyDiscountRequest.CartItemRequest();
                    cartItem.setCourseId(item.getCourse().getCourseId());
                    cartItem.setPrice(item.getPrice());
                    return cartItem;
                })
                .collect(Collectors.toList());

        request.setCartItems(cartItems);
        
        return request;
    }

    public DiscountCalculationResponse calculateDiscount(ApplyDiscountRequest request) {
        log.info("Calculating discount for user: {}", request.getUserId());
        
        BigDecimal subtotal = BigDecimal.ZERO;
        List<DiscountCalculationResponse.ItemPrice> itemPrices = new ArrayList<>();
        List<DiscountCalculationResponse.DiscountDetail> discounts = new ArrayList<>();
        
        // Get active promotions
        LocalDateTime now = LocalDateTime.now();
        List<PromotionEntity> activePromotions = promotionRepository.findActivePromotions(now);
        
        // Sort by priority (DESC)
        activePromotions.sort(Comparator.comparing(PromotionEntity::getPriority).reversed());
        
        // Calculate discount per item
        for (ApplyDiscountRequest.CartItemRequest item : request.getCartItems()) {
            CourseEntity course = courseRepository.findById(item.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found: " + item.getCourseId()));
            
            BigDecimal originalPrice = item.getPrice();
            BigDecimal discountPrice = originalPrice;
            BigDecimal appliedDiscount = BigDecimal.ZERO;
            
            subtotal = subtotal.add(originalPrice);
            
            // Find best promotion for this item
            BigDecimal bestDiscount = BigDecimal.ZERO;
            PromotionEntity bestPromotion = null;
            PromotionRuleEntity bestRule = null;
            
            for (PromotionEntity promotion : activePromotions) {
                for (PromotionRuleEntity rule : promotion.getRules()) {
                    if (isRuleApplicable(rule, course, request)) {
                        BigDecimal ruleDiscount = calculateRuleDiscount(rule, originalPrice);
                        
                        // Select best discount (or use priority as tie-breaker)
                        if (ruleDiscount.compareTo(bestDiscount) > 0 ||
                            (ruleDiscount.compareTo(bestDiscount) == 0 && 
                             bestPromotion != null &&
                             promotion.getPriority() > bestPromotion.getPriority())) {
                            bestDiscount = ruleDiscount;
                            bestPromotion = promotion;
                            bestRule = rule;
                        }
                    }
                }
            }
            
            // Apply best promotion if found
            if (bestPromotion != null && bestDiscount.compareTo(BigDecimal.ZERO) > 0) {
                discountPrice = originalPrice.subtract(bestDiscount);
                appliedDiscount = bestDiscount;
                
                log.info("Applied best promotion '{}' (priority: {}) with discount: {} for course: {}", 
                        bestPromotion.getName(), 
                        bestPromotion.getPriority(),
                        bestDiscount, 
                        course.getTitle());
                
                // Add to discounts list
                addOrUpdateDiscount(discounts, OrderDiscountType.PROMOTION.name(), 
                        bestPromotion.getName(), bestPromotion.getDescription(), bestDiscount);
            }
            
            // Add item price
            itemPrices.add(DiscountCalculationResponse.ItemPrice.builder()
                    .courseId(course.getCourseId())
                    .courseName(course.getTitle())
                    .originalPrice(originalPrice)
                    .discountPrice(discountPrice)
                    .finalPrice(discountPrice)
                    .savings(appliedDiscount)
                    .build());
        }
        
        // Apply voucher if provided
        if (request.getVoucherCode() != null && !request.getVoucherCode().isEmpty()) {
            VoucherEntity voucher = voucherRepository.findByCodeAndIsDeletedFalse(request.getVoucherCode())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_CODE_NOT_FOUND.getMessage()));
            
            // Filter applicable items
            List<DiscountCalculationResponse.ItemPrice> applicableItems = itemPrices.stream()
                    .filter(item -> isCourseApplicableForVoucher(item.getCourseId(), voucher))
                    .collect(Collectors.toList());

            BigDecimal applicableTotal = applicableItems.stream()
                    .map(DiscountCalculationResponse.ItemPrice::getDiscountPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            validateVoucherForUse(voucher, request.getUserId(), applicableTotal, applicableItems.isEmpty());
            
            BigDecimal voucherDiscount = calculateVoucherDiscount(voucher, applicableTotal);
            
            if (voucherDiscount.compareTo(BigDecimal.ZERO) > 0) {
                // Apply voucher discount proportionally to APPLICABLE items
                applyVoucherToItems(applicableItems, voucherDiscount);
                
                addOrUpdateDiscount(discounts, OrderDiscountType.VOUCHER.name(),
                        voucher.getName(), voucher.getDescription(), voucherDiscount);
            }
        }
        
        // Calculate final amount
        BigDecimal finalAmount = itemPrices.stream()
                .map(DiscountCalculationResponse.ItemPrice::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalDiscount = subtotal.subtract(finalAmount);
        
        return DiscountCalculationResponse.builder()
                .subtotal(subtotal)
                .totalDiscount(totalDiscount)
                .finalAmount(finalAmount)
                .discounts(discounts)
                .itemPrices(itemPrices)
                .build();
    }

    @Override
    @Transactional
    public void applyDiscountToOrder(OrderEntity order, String voucherCode) {
        log.info("Applying discount to order: {}", order.getOrderId());

        // Calculate discounts (reuse calculation logic)
        ApplyDiscountRequest request = buildRequestFromOrder(order);
        request.setVoucherCode(voucherCode);

        DiscountCalculationResponse calculation = calculateDiscount(request);

        // Update Order Items final price
        // Note: calculateDiscount returns ItemPrices with finalPrice. 
        // We need to map these back to OrderItemEntities.
        List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);
        
        for (DiscountCalculationResponse.ItemPrice itemPrice : calculation.getItemPrices()) {
             orderItems.stream()
                 .filter(oi -> oi.getCourse().getCourseId().equals(itemPrice.getCourseId()))
                 .findFirst()
                 .ifPresent(oi -> {
                     oi.setDiscountPrice(itemPrice.getDiscountPrice()); // Price after promotion
                     oi.setFinalPrice(itemPrice.getFinalPrice());     // Price after voucher
                     // Update discount amount on item (original - final)
                     // or accumulate savings
                     orderItemRepository.save(oi);
                 });
        }

        // Create order discount records
        for (DiscountCalculationResponse.DiscountDetail discount : calculation.getDiscounts()) {
            OrderDiscountEntity orderDiscount = OrderDiscountEntity.builder()
                    .order(order)
                    .discountType(OrderDiscountType.valueOf(discount.getType()))
                    .discountAmount(discount.getAmount())
                    .description(discount.getName() + " - " + discount.getDescription())
                    .build();

            orderDiscountRepository.save(orderDiscount);
        }

        // Update order totals
        order.setDiscountAmount(calculation.getTotalDiscount());
        order.setFinalAmount(calculation.getFinalAmount());
        orderRepository.save(order);

        // Mark voucher as used if applicable
        if (voucherCode != null && !voucherCode.isEmpty()) {
            markVoucherAsUsed(voucherCode, order.getUser().getUserId(), order);
        }

        log.info("Discount applied successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailableDiscounts(Long userId) {
        List<String> discounts = new ArrayList<>();

        // Get active promotions
        LocalDateTime now = LocalDateTime.now();
        List<PromotionEntity> promotions = promotionRepository.findActivePromotions(now);

        for (PromotionEntity promotion : promotions) {
            discounts.add(promotion.getName() + ": " + promotion.getDescription());
        }

        // Get available user vouchers
        List<UserVoucherEntity> userVouchers = userVoucherRepository.findAvailableVouchers(userId, now);

        for (UserVoucherEntity uv : userVouchers) {
            VoucherEntity voucher = uv.getVoucher();
            discounts.add(voucher.getCode() + ": " + voucher.getName());
        }

        return discounts;
    }

    // Helper methods
    private boolean isRuleApplicable(PromotionRuleEntity rule, CourseEntity course, ApplyDiscountRequest request) {
        return switch (rule.getRuleType()) {
            case ALL -> true;
            case COURSE -> course.getCourseId().equals(rule.getTargetId());
            case CATEGORY -> course.getCategory().getId().equals(rule.getTargetId());
            case CART_TOTAL -> {
                BigDecimal cartTotal = request.getCartItems().stream()
                        .map(ApplyDiscountRequest.CartItemRequest::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                yield rule.getMinPurchaseAmount() == null ||
                        cartTotal.compareTo(rule.getMinPurchaseAmount()) >= 0;
            }
            case BUY_X_GET_Y -> request.getCartItems().size() >= (rule.getBuyQuantity() + rule.getGetQuantity());
            default -> false;
        };
    }

    private BigDecimal calculateRuleDiscount(PromotionRuleEntity rule, BigDecimal price) {
        return calculateDiscount(rule.getDiscountType(), rule.getDiscountValue(), 
                rule.getMaxDiscountAmount(), price);
    }

    private BigDecimal calculateVoucherDiscount(VoucherEntity voucher, BigDecimal cartTotal) {
        return calculateDiscount(voucher.getDiscountType(), voucher.getDiscountValue(), 
                voucher.getMaxDiscountAmount(), cartTotal);
    }

    /**
     * Generic discount calculation method
     * Supports both PERCENTAGE and FIXED discount types
     */
    private BigDecimal calculateDiscount(DiscountType discountType, BigDecimal discountValue, 
                                          BigDecimal maxDiscountAmount, BigDecimal baseAmount) {
        if (discountType == DiscountType.PERCENTAGE) {
            BigDecimal discount = baseAmount.multiply(discountValue)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Apply max discount cap if exists
            if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                return maxDiscountAmount;
            }

            return discount;
        } else {
            // FIXED discount - cannot exceed base amount
            return discountValue.min(baseAmount);
        }
    }

    private void applyVoucherToItems(List<DiscountCalculationResponse.ItemPrice> items, BigDecimal voucherDiscount) {
        if (items.isEmpty()) return;
        
        BigDecimal totalApplicableAmount = items.stream()
                .map(DiscountCalculationResponse.ItemPrice::getDiscountPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalApplicableAmount.compareTo(BigDecimal.ZERO) == 0) return;

        BigDecimal remainingDiscount = voucherDiscount;

        for (int i = 0; i < items.size(); i++) {
            DiscountCalculationResponse.ItemPrice item = items.get(i);
            BigDecimal itemDiscount;

            if (i == items.size() - 1) {
                // Last item gets remaining discount
                itemDiscount = remainingDiscount;
            } else {
                // Proportional discount based on item's share of APPLICABLE total
                BigDecimal proportion = item.getDiscountPrice().divide(totalApplicableAmount, 4, RoundingMode.HALF_UP);
                itemDiscount = voucherDiscount.multiply(proportion).setScale(2, RoundingMode.HALF_UP);
                remainingDiscount = remainingDiscount.subtract(itemDiscount);
            }
            
            // Ensure discount doesn't exceed price
            if (itemDiscount.compareTo(item.getDiscountPrice()) > 0) {
                 itemDiscount = item.getDiscountPrice();
                 // If limited, we might have leftover discount. 
                 // Simple logic: just cap it. Real logic might redistribute.
            }

            BigDecimal newFinalPrice = item.getDiscountPrice().subtract(itemDiscount);
            item.setFinalPrice(newFinalPrice);
            item.setSavings(item.getSavings().add(itemDiscount));
        }
    }

    private void validateVoucherForUse(VoucherEntity voucher, Long userId, BigDecimal applicableTotal, boolean noApplicableItems) {
        LocalDateTime now = LocalDateTime.now();

        if (!voucher.getIsActive()) {
            throw new BusinessException(ErrorCode.VOUCHER_NOT_ACTIVE.getMessage());
        }

        if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())) {
            throw new BusinessException(ErrorCode.VOUCHER_EXPIRED.getMessage());
        }
        
        if (noApplicableItems) {
            throw new BusinessException("Voucher không áp dụng cho các khóa học trong giỏ hàng");
        }

        if (voucher.getMinOrderValue() != null && applicableTotal.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new BusinessException(ErrorCode.VOUCHER_MIN_PURCHASE_NOT_MET.getMessage());
        }

        // Check if user has this voucher
        List<UserVoucherEntity> userVouchers = userVoucherRepository
                .findByUser_UserIdAndVoucher_VoucherIdAndIsDeletedFalse(userId, voucher.getVoucherId());

        if (userVouchers.isEmpty()) {
            throw new BusinessException(ErrorCode.VOUCHER_NOT_APPLICABLE.getMessage());
        }

        // Check if already used
        boolean hasUnusedVoucher = userVouchers.stream().anyMatch(uv -> !uv.getIsUsed());
        if (!hasUnusedVoucher) {
            throw new BusinessException(ErrorCode.VOUCHER_ALREADY_USED.getMessage());
        }
    }
    
    private boolean isCourseApplicableForVoucher(Long courseId, VoucherEntity voucher) {
        return switch (voucher.getApplicableTo()) {
            case ALL -> true;
            case SPECIFIC_COURSES -> voucher.getApplicableCourses().stream()
                    .anyMatch(c -> c.getCourseId().equals(courseId));
            case CATEGORY -> {
                 CourseEntity course = courseRepository.findById(courseId).orElse(null);
                 if (course == null || course.getCategory() == null) yield false;
                 
                 CategoryEntity category = course.getCategory();
                 // Check category and its parents
                 yield isCategoryInList(category, voucher.getApplicableCategoryIds());
            }
        };
    }
    
    private boolean isCategoryInList(CategoryEntity category, List<Long> allowedIds) {
        if (category == null) return false;
        if (allowedIds.contains(category.getId())) return true;
        // Recursively check parent
        return isCategoryInList(category.getParent(), allowedIds);
    }

    private void markVoucherAsUsed(String code, Long userId, OrderEntity order) {
        VoucherEntity voucher = voucherRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_CODE_NOT_FOUND.getMessage()));

        List<UserVoucherEntity> userVouchers = userVoucherRepository
                .findByUser_UserIdAndVoucher_VoucherIdAndIsDeletedFalse(userId, voucher.getVoucherId());

        // Find first unused voucher
        UserVoucherEntity unusedVoucher = userVouchers.stream()
                .filter(uv -> !uv.getIsUsed())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No unused voucher found"));

        unusedVoucher.setIsUsed(true);
        unusedVoucher.setUsedAt(LocalDateTime.now());
        unusedVoucher.setOrder(order);

        userVoucherRepository.save(unusedVoucher);

        // Increment voucher used count
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);
    }

    private void addOrUpdateDiscount(List<DiscountCalculationResponse.DiscountDetail> discounts,
            String type, String name, String description, BigDecimal amount) {
        Optional<DiscountCalculationResponse.DiscountDetail> existing = discounts.stream()
                .filter(d -> d.getType().equals(type) && d.getName().equals(name))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setAmount(existing.get().getAmount().add(amount));
        } else {
            discounts.add(DiscountCalculationResponse.DiscountDetail.builder()
                    .type(type)
                    .name(name)
                    .description(description)
                    .amount(amount)
                    .build());
        }
    }


}
