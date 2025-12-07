package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.ApiResponse;
import org.example.elearning.dto.response.EnrollmentResponse;
import org.example.elearning.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Enrollment", description = "APIs quản lý ghi danh khóa học - Dành cho STUDENT")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class EnrollmentController {
    EnrollmentService enrollmentService;

    @GetMapping
    @Operation(summary = "Lấy danh sách khóa học đã đăng ký")
    public ApiResponse<List<EnrollmentResponse>> getMyEnrollments() {
        return ApiResponse.<List<EnrollmentResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách enrollment thành công")
                .data(enrollmentService.getMyEnrollments())
                .build();
    }

    @GetMapping("/{enrollmentId}")
    @Operation(summary = "Lấy chi tiết enrollment")
    public ApiResponse<EnrollmentResponse> getEnrollmentDetail(@PathVariable Long enrollmentId) {
        return ApiResponse.<EnrollmentResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy chi tiết enrollment thành công")
                .data(enrollmentService.getEnrollmentDetail(enrollmentId))
                .build();
    }

    @PutMapping("/{enrollmentId}/progress")
    @Operation(summary = "Cập nhật tiến độ học")
    public ApiResponse<Void> updateProgress(
            @PathVariable Long enrollmentId,
            @RequestParam Float progress) {
        enrollmentService.updateProgress(enrollmentId, progress);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật tiến độ thành công")
                .build();
    }

    @GetMapping("/check/{courseId}")
    @Operation(summary = "Kiểm tra đã đăng ký khóa học chưa")
    public ApiResponse<Boolean> isEnrolled(@PathVariable Long courseId) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Kiểm tra thành công")
                .data(enrollmentService.isEnrolled(courseId))
                .build();
    }
}

