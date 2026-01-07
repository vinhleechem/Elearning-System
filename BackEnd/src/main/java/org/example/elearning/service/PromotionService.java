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
     * Get active promotion entities (for internal service usage)
     */
    List<org.example.elearning.entity.PromotionEntity> getActivePromotionEntities();

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

    /**
     * Export promotions to Excel
     */
    byte[] exportPromotions() throws java.io.IOException;

    /**
     * Apply best promotion to course response
     * Finds the best applicable promotion and updates the response with discount information
     */
    void applyBestPromotionToCourse(org.example.elearning.dto.response.CourseResponse response, 
                                     org.example.elearning.entity.CourseEntity course);

    /**
     * Apply best promotion to cart item response
     * Finds the best applicable promotion and updates the cart item with discount information
     */
    void applyBestPromotionToCartItem(org.example.elearning.dto.response.CartItemResponse response, 
                                       org.example.elearning.entity.CourseEntity course);

    void importPromotions(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
}
