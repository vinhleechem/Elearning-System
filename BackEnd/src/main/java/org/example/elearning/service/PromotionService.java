package org.example.elearning.service;

import org.example.elearning.dto.request.PromotionRequest;
import org.example.elearning.dto.response.PromotionDetailResponse;
import org.example.elearning.dto.response.PromotionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PromotionService {

    /**
     * Create new promotion with rules
     */
    PromotionDetailResponse createPromotion(PromotionRequest request);

    /**
     * Update existing promotion
     */
    PromotionDetailResponse updatePromotion(Long promotionId, PromotionRequest request);

    /**
     * Get promotion by ID
     */
    PromotionDetailResponse getPromotionById(Long promotionId);

    /**
     * Get all promotions with pagination
     */
    Page<PromotionResponse> getAllPromotions(Pageable pageable);

    /**
     * Get active promotions
     */
    List<PromotionResponse> getActivePromotions();

    /**
     * Delete promotion (soft delete)
     */
    void deletePromotion(Long promotionId);

    /**
     * Activate promotion
     */
    void activatePromotion(Long promotionId);

    /**
     * Deactivate promotion
     */
    void deactivatePromotion(Long promotionId);
}
