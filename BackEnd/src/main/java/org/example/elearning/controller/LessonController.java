package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.LessonRequest;
import org.example.elearning.dto.response.LessonResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.LessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/sections/{sectionId}/lessons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonController {

    LessonService lessonService;

    @Operation(summary = "Lấy danh sách bài học theo section")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping
    public ResponseEntity<StandardResponse<List<LessonResponse>>> getLessons(@PathVariable Long sectionId) {
        List<LessonResponse> result = lessonService.getLessonsBySection(sectionId);
        return ResponseEntity.ok(success("Lấy danh sách bài học thành công", result));
    }

    @Operation(summary = "Lấy chi tiết bài học")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{lessonId}")
    public ResponseEntity<StandardResponse<LessonResponse>> getLesson(
            @PathVariable Long sectionId,
            @PathVariable Long lessonId) {
        LessonResponse result = lessonService.getLessonById(lessonId);
        return ResponseEntity.ok(success("Lấy bài học thành công", result));
    }

    @Operation(summary = "Tạo bài học mới trong section")
    @ApiResponse(responseCode = "200", description = "Tạo thành công")
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<LessonResponse>> createLesson(
            @PathVariable Long sectionId,
            @Valid @RequestBody LessonRequest request) {
        LessonResponse result = lessonService.createLesson(sectionId, request);
        return ResponseEntity.ok(success("Tạo bài học thành công", result));
    }

    @Operation(summary = "Cập nhật bài học")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<LessonResponse>> updateLesson(
            @PathVariable Long sectionId,
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request) {
        LessonResponse result = lessonService.updateLesson(lessonId, request);
        return ResponseEntity.ok(success("Cập nhật bài học thành công", result));
    }

    @Operation(summary = "Xóa bài học")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<String>> deleteLesson(
            @PathVariable Long sectionId,
            @PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.ok(success("Xóa bài học thành công"));
    }
}
