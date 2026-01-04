package org.example.elearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.PromotionRequest;
import org.example.elearning.dto.request.PromotionRuleRequest;
import org.example.elearning.dto.response.CartItemResponse;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PromotionDetailResponse;
import org.example.elearning.dto.response.PromotionResponse;
import org.example.elearning.dto.response.PromotionRuleResponse;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.PromotionEntity;
import org.example.elearning.entity.PromotionRuleEntity;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.PromotionRuleType;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.PromotionMapper;
import org.example.elearning.repository.PromotionRepository;
import org.example.elearning.service.PromotionService;
import org.example.elearning.service.CourseService;
import org.example.elearning.service.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final CourseService courseService;
    private final CategoryService categoryService;
    private final PromotionMapper promotionMapper;

    @Override
    @Transactional
    public PromotionDetailResponse createPromotion(PromotionRequest request) {
        log.info("Creating new promotion: {}", request.getName());
        
        // Create promotion entity using mapper
        PromotionEntity promotion = promotionMapper.toEntity(request);
        promotion.setRules(new ArrayList<>());
        
        // Create promotion rules
        for (PromotionRuleRequest ruleRequest : request.getRules()) {
            PromotionRuleEntity rule = PromotionRuleEntity.builder()
                    .promotion(promotion)
                    .ruleType(ruleRequest.getRuleType())
                    .targetId(ruleRequest.getTargetId())
                    .discountType(ruleRequest.getDiscountType())
                    .discountValue(ruleRequest.getDiscountValue())
                    .maxDiscountAmount(ruleRequest.getMaxDiscountAmount())
                    .minPurchaseAmount(ruleRequest.getMinPurchaseAmount())
                    .buyQuantity(ruleRequest.getBuyQuantity())
                    .getQuantity(ruleRequest.getGetQuantity())
                    .build();
            
            promotion.getRules().add(rule);
        }
        
        promotion = promotionRepository.save(promotion);
        log.info("Promotion created successfully with ID: {}", promotion.getPromotionId());
        
        return promotionMapper.toDetailResponse(promotion);
    }

    @Override
    @Transactional
    public PromotionDetailResponse updatePromotion(Long promotionId, PromotionRequest request) {
        log.info("Updating promotion ID: {}", promotionId);

        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        // Update basic fields using mapper
        promotionMapper.updateEntity(promotion, request);

        // Clear old rules and add new ones
        promotion.getRules().clear();

        for (PromotionRuleRequest ruleRequest : request.getRules()) {
            PromotionRuleEntity rule = PromotionRuleEntity.builder()
                    .promotion(promotion)
                    .ruleType(ruleRequest.getRuleType())
                    .targetId(ruleRequest.getTargetId())
                    .discountType(ruleRequest.getDiscountType())
                    .discountValue(ruleRequest.getDiscountValue())
                    .maxDiscountAmount(ruleRequest.getMaxDiscountAmount())
                    .minPurchaseAmount(ruleRequest.getMinPurchaseAmount())
                    .buyQuantity(ruleRequest.getBuyQuantity())
                    .getQuantity(ruleRequest.getGetQuantity())
                    .build();

            promotion.getRules().add(rule);
        }

        promotion = promotionRepository.save(promotion);
        log.info("Promotion updated successfully");

        return promotionMapper.toDetailResponse(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionDetailResponse getPromotionById(Long promotionId) {
        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        return promotionMapper.toDetailResponse(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PromotionResponse> getAllPromotions(Pageable pageable) {
        return promotionRepository.findAll(pageable)
                .map(promotionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        List<PromotionEntity> promotions = promotionRepository.findActivePromotions(now);

        return promotions.stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionEntity> getActivePromotionEntities() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findActivePromotions(now);
    }

    @Override
    @Transactional
    public void deletePromotion(Long promotionId) {
        log.info("Deleting promotion ID: {}", promotionId);

        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        promotion.setDeleted(true);
        promotionRepository.save(promotion);
        log.info("Promotion soft deleted successfully");
    }

    @Override
    @Transactional
    public void activatePromotion(Long promotionId) {
        log.info("Activating promotion ID: {}", promotionId);

        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        promotion.setIsActive(true);
        promotionRepository.save(promotion);

        log.info("Promotion activated successfully");
    }

    @Override
    @Transactional
    public void deactivatePromotion(Long promotionId) {
        log.info("Deactivating promotion ID: {}", promotionId);

        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        promotion.setIsActive(false);
        promotionRepository.save(promotion);

        log.info("Promotion deactivated successfully");
    }

    @Override
    public void applyBestPromotionToCourse(CourseResponse response, CourseEntity course) {
        if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        List<PromotionEntity> activePromotions = getActivePromotionEntities();
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
            response.setPromotionName(bestPromotion.getName());
            response.setPromotionType(bestPromotion.getPromotionType().name());
            response.setPromotionEndDate(bestPromotion.getEndDate());

            BigDecimal finalPrice = course.getPrice().subtract(bestDiscountAmount);
            if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
                finalPrice = BigDecimal.ZERO;
            }

            response.setDiscountPrice(finalPrice);

            // Calculate percentage
            int percentage = bestDiscountAmount.divide(course.getPrice(), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100)).intValue();
            response.setDiscountPercentage(percentage);
        }
    }

    @Override
    public void applyBestPromotionToCartItem(CartItemResponse response, CourseEntity course) {
        if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        List<PromotionEntity> activePromotions = getActivePromotionEntities();
        BigDecimal bestDiscountAmount = BigDecimal.ZERO;

        for (PromotionEntity promotion : activePromotions) {
            for (PromotionRuleEntity rule : promotion.getRules()) {
                if (isRuleApplicable(rule, course)) {
                    BigDecimal discountAmount = calculateDiscountAmount(rule, course.getPrice());
                    if (discountAmount.compareTo(bestDiscountAmount) > 0) {
                        bestDiscountAmount = discountAmount;
                    }
                }
            }
        }

        if (bestDiscountAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal finalPrice = course.getPrice().subtract(bestDiscountAmount);
            if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
                finalPrice = BigDecimal.ZERO;
            }
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
