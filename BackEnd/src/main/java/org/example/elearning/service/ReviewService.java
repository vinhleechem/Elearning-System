package org.example.elearning.service;

import org.example.elearning.dto.request.CreateReviewRequest;
import org.example.elearning.dto.request.UpdateReviewRequest;
import org.example.elearning.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(CreateReviewRequest request);
    ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request);
    void deleteReview(Long reviewId);
    Page<ReviewResponse> getReviewsByCourse(Long courseId, Pageable pageable);
    ReviewResponse getMyReviewForCourse(Long courseId);
    Page<ReviewResponse> getAllReviews(Pageable pageable, String search, Integer rating, Long courseId);
    void importReviews(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
}

