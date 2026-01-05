package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.UpdateReviewRequest;
import org.example.elearning.dto.response.ReviewResponse;
import org.example.elearning.dto.response.StandardResponse;
import static org.example.elearning.dto.response.StandardResponse.success;
import org.example.elearning.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import org.example.elearning.dto.request.CreateReviewRequest;
import org.springframework.http.HttpStatus;


@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Review", description = "APIs quản lý đánh giá khóa học")
public class ReviewController {
    ReviewService reviewService;



    @PostMapping
    @Operation(summary = "Tạo đánh giá mới")
    public ResponseEntity<StandardResponse<ReviewResponse>> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(success("Tạo đánh giá thành công", 
                reviewService.createReview(request)));
    }

    @PutMapping("/{reviewId}")
    @Operation(summary = "Cập nhật đánh giá")
    public ResponseEntity<StandardResponse<ReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(success("Cập nhật đánh giá thành công", 
                reviewService.updateReview(reviewId, request)));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Xóa đánh giá - STUDENT xóa của mình, ADMIN xóa bất kỳ")
    public ResponseEntity<StandardResponse<Void>> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(success("Xóa đánh giá thành công", null));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Lấy danh sách đánh giá của khóa học")
    public ResponseEntity<StandardResponse<Page<ReviewResponse>>> getReviewsByCourse(
            @PathVariable Long courseId,
            Pageable pageable) {
        return ResponseEntity.ok(success("Lấy danh sách đánh giá thành công", 
                reviewService.getReviewsByCourse(courseId, pageable)));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy tất cả đánh giá - ADMIN only", 
               description = "Hỗ trợ filter theo rating (1-5 sao) và courseId")
    public ResponseEntity<StandardResponse<Page<ReviewResponse>>> getAllReviews(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Long courseId) {
        return ResponseEntity.ok(success("Lấy danh sách đánh giá thành công", 
                reviewService.getAllReviews(pageable, search, rating, courseId)));
    }

    @GetMapping("/my-review/{courseId}")
    @Operation(summary = "Lấy đánh giá của tôi cho khóa học")
    public ResponseEntity<StandardResponse<ReviewResponse>> getMyReviewForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(success("Lấy đánh giá thành công", 
                reviewService.getMyReviewForCourse(courseId)));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Import đánh giá từ file Excel")
    public ResponseEntity<StandardResponse<Void>> importReviews(@RequestParam("file") MultipartFile file) throws IOException {
        reviewService.importReviews(file);
        return ResponseEntity.ok(success("Import đánh giá thành công", null));
    }
}
