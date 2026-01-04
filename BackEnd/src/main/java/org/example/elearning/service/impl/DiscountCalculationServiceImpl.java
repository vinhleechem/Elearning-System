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

    @Override
    @Transactional(readOnly = true)
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
            
            // Apply promotions
            for (PromotionEntity promotion : activePromotions) {
                for (PromotionRuleEntity rule : promotion.getRules()) {
                    if (isRuleApplicable(rule, course, request)) {
                        BigDecimal ruleDiscount = calculateRuleDiscount(rule, discountPrice);
                        
                        if (ruleDiscount.compareTo(BigDecimal.ZERO) > 0) {
                            discountPrice = discountPrice.subtract(ruleDiscount);
                            appliedDiscount = appliedDiscount.add(ruleDiscount);
                            
                            // Add to discounts list
                            addOrUpdateDiscount(discounts, OrderDiscountType.PROMOTION.name(), 
                                    promotion.getName(), promotion.getDescription(), ruleDiscount);
                        }
                    }
                }
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
        
        // Calculate cart total after promotions
        BigDecimal cartTotal = itemPrices.stream()
                .map(DiscountCalculationResponse.ItemPrice::getDiscountPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Apply voucher if provided
        if (request.getVoucherCode() != null && !request.getVoucherCode().isEmpty()) {
            VoucherEntity voucher = voucherRepository.findByCodeAndIsDeletedFalse(request.getVoucherCode())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_CODE_NOT_FOUND.getMessage()));
            
            validateVoucherForUse(voucher, request.getUserId(), cartTotal);
            
            BigDecimal voucherDiscount = calculateVoucherDiscount(voucher, cartTotal);
            
            if (voucherDiscount.compareTo(BigDecimal.ZERO) > 0) {
                // Apply voucher discount proportionally to items
                applyVoucherToItems(itemPrices, voucherDiscount);
                
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
        BigDecimal totalBeforeVoucher = items.stream()
                .map(DiscountCalculationResponse.ItemPrice::getDiscountPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingDiscount = voucherDiscount;

        for (int i = 0; i < items.size(); i++) {
            DiscountCalculationResponse.ItemPrice item = items.get(i);
            BigDecimal itemDiscount;

            if (i == items.size() - 1) {
                // Last item gets remaining discount
                itemDiscount = remainingDiscount;
            } else {
                // Proportional discount
                BigDecimal proportion = item.getDiscountPrice().divide(totalBeforeVoucher, 4, RoundingMode.HALF_UP);
                itemDiscount = voucherDiscount.multiply(proportion).setScale(2, RoundingMode.HALF_UP);
                remainingDiscount = remainingDiscount.subtract(itemDiscount);
            }

            BigDecimal newFinalPrice = item.getDiscountPrice().subtract(itemDiscount);
            item.setFinalPrice(newFinalPrice);
            item.setSavings(item.getSavings().add(itemDiscount));
        }
    }

    private void validateVoucherForUse(VoucherEntity voucher, Long userId, BigDecimal cartTotal) {
        LocalDateTime now = LocalDateTime.now();

        if (!voucher.getIsActive()) {
            throw new BusinessException(ErrorCode.VOUCHER_NOT_ACTIVE.getMessage());
        }

        if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())) {
            throw new BusinessException(ErrorCode.VOUCHER_EXPIRED.getMessage());
        }

        if (voucher.getMinOrderValue() != null && cartTotal.compareTo(voucher.getMinOrderValue()) < 0) {
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

    private ApplyDiscountRequest buildRequestFromOrder(OrderEntity order) {
        ApplyDiscountRequest request = new ApplyDiscountRequest();
        request.setUserId(order.getUser().getUserId());

        // TODO: OrderEntity doesn't have getOrderItems() relationship
        // Need to add @OneToMany relationship to OrderItemEntity first
        // For now, return empty list
        request.setCartItems(new ArrayList<>());
        
        /*
        List<ApplyDiscountRequest.CartItemRequest> cartItems = order.getOrderItems().stream()
                .map(item -> {
                    ApplyDiscountRequest.CartItemRequest cartItem = new ApplyDiscountRequest.CartItemRequest();
                    cartItem.setCourseId(item.getCourse().getCourseId());
                    cartItem.setPrice(item.getPrice());
                    return cartItem;
                })
                .collect(Collectors.toList());

        request.setCartItems(cartItems);
        */
        return request;
    }
}
