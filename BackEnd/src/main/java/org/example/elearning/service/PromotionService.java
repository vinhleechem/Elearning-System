package org.example.elearning.service;

import org.example.elearning.dto.request.PromotionRequest;
import org.example.elearning.dto.response.CartItemResponse;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PromotionDetailResponse;
import org.example.elearning.dto.response.PromotionResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.PromotionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PromotionService {


    PromotionDetailResponse createPromotion(PromotionRequest request);


    PromotionDetailResponse updatePromotion(Long promotionId, PromotionRequest request);


    PromotionDetailResponse getPromotionById(Long promotionId);


    Page<PromotionResponse> getAllPromotions(Pageable pageable);


    List<PromotionResponse> getActivePromotions();


    List<PromotionEntity> getActivePromotionEntities();

    void deletePromotion(Long promotionId);


    void activatePromotion(Long promotionId);

    void deactivatePromotion(Long promotionId);


    byte[] exportPromotions() throws java.io.IOException;


    void applyBestPromotionToCourse(CourseResponse response,
                                    CourseEntity course);


    void applyBestPromotionToCartItem(CartItemResponse response,
                                      CourseEntity course);


    void syncCoursePrices();


    void syncCoursePrice(Long courseId);

    void importPromotions(MultipartFile file) throws java.io.IOException;
}
