package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.VideoPositionRequest;
import org.example.elearning.dto.response.LessonProgressResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.LessonProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/enrollments/{enrollmentId}/progress")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Lesson Progress API", description = "Quản lý tiến độ học tập của học viên")
public class LessonProgressController {
    LessonProgressService lessonProgressService;
    @Operation(summary = "Đánh dấu hoàn thành hoặc bỏ đánh dấu bài học")
    @PostMapping("/lessons/{lessonId}/toggle-complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StandardResponse<Void>> toggleLessonComplete(
            @PathVariable Long enrollmentId,
            @PathVariable Long lessonId,
            @RequestParam(defaultValue = "false") boolean isToggle) {

        lessonProgressService.markLessonCompleted(enrollmentId, lessonId, isToggle);

        String msg = isToggle ? "Đã thay đổi trạng thái bài học" : "Đã đánh dấu hoàn thành bài học";
        return ResponseEntity.ok(success(msg, null));
    }

    @Operation(summary = "Cập nhật vị trí đang xem video (Heartbeat)")
    @PutMapping("/lessons/{lessonId}/position")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StandardResponse<Void>> updateVideoPosition(
            @PathVariable Long enrollmentId,
            @PathVariable Long lessonId,
            @Valid @RequestBody VideoPositionRequest request) {

        // Gọi Service
        lessonProgressService.updateVideoPosition(enrollmentId, lessonId, request.getPositionSeconds());

        return ResponseEntity.ok(success("Đã lưu vị trí video", null));
    }

    @Operation(summary = "Lấy toàn bộ tiến độ các bài học của khóa học")
    @GetMapping
    public ResponseEntity<StandardResponse<List<LessonProgressResponse>>> getEnrollmentProgress(
            @PathVariable Long enrollmentId) {

        List<LessonProgressResponse> progressList = lessonProgressService.getEnrollmentProgress(enrollmentId);
        return ResponseEntity.ok(success("Lấy thông tin tiến độ thành công", progressList));
    }

    @Operation(summary = "Lấy tiến độ của một bài học cụ thể")
    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<StandardResponse<LessonProgressResponse>> getLessonProgress(
            @PathVariable Long enrollmentId,
            @PathVariable Long lessonId) {

        LessonProgressResponse progress = lessonProgressService.getLessonProgress(enrollmentId, lessonId);
        return ResponseEntity.ok(success("Lấy thông tin bài học thành công", progress));
    }
}
