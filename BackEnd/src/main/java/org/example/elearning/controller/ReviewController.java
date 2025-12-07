package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.UpdateReviewRequest;
import org.example.elearning.dto.response.ApiResponse;
import org.example.elearning.dto.response.ReviewResponse;
import org.example.elearning.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Review", description = "APIs quản lý đánh giá khóa học")
public class ReviewController {
    ReviewService reviewService;

//    @PostMapping
//    @Operation(summary = "Tạo đánh giá mới")
//    public ApiResponse<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
//        return ApiResponse.<ReviewResponse>builder()
//                .code(HttpStatus.CREATED.value())
//                .message("Tạo đánh giá thành công")
//                .data(reviewService.createReview(request))
//                .build();
//    }

    @PutMapping("/{reviewId}")
    @Operation(summary = "Cập nhật đánh giá")
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật đánh giá thành công")
                .data(reviewService.updateReview(reviewId, request))
                .build();
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Xóa đánh giá - STUDENT xóa của mình, ADMIN xóa bất kỳ")
    public ApiResponse<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa đánh giá thành công")
                .build();
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Lấy danh sách đánh giá của khóa học")
    public ApiResponse<Page<ReviewResponse>> getReviewsByCourse(
            @PathVariable Long courseId,
            Pageable pageable) {
        return ApiResponse.<Page<ReviewResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách đánh giá thành công")
                .data(reviewService.getReviewsByCourse(courseId, pageable))
                .build();
    }

    @GetMapping("/my-review/{courseId}")
    @Operation(summary = "Lấy đánh giá của tôi cho khóa học")
    public ApiResponse<ReviewResponse> getMyReviewForCourse(@PathVariable Long courseId) {
        return ApiResponse.<ReviewResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy đánh giá thành công")
                .data(reviewService.getMyReviewForCourse(courseId))
                .build();
    }
}
