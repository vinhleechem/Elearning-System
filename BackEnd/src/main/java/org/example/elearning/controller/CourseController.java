package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseController {

    CourseService courseService;

    @Operation(summary = "Lấy danh sách khóa học (public)")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping
    public ResponseEntity<StandardResponse<Page<CourseResponse>>> getCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String level) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CourseResponse> result = courseService.getPublicCourses(pageable, search, categoryId, level);
        return ResponseEntity.ok(success("Lấy danh sách khóa học thành công", result));
    }

    @Operation(summary = "Lấy chi tiết khóa học theo slug")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{slug}")
    public ResponseEntity<StandardResponse<CourseResponse>> getCourseBySlug(@PathVariable String slug) {
        CourseResponse result = courseService.getCourseBySlug(slug);
        return ResponseEntity.ok(success("Lấy khóa học thành công", result));
    }

    // Các API dưới đây dành cho instructor/admin

    @Operation(summary = "Tạo khóa học mới")
    @ApiResponse(responseCode = "200", description = "Tạo thành công")
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request) {
        CourseResponse result = courseService.createCourse(request);
        return ResponseEntity.ok(success("Tạo khóa học thành công", result));
    }

    @Operation(summary = "Cập nhật khóa học")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        CourseResponse result = courseService.updateCourse(id, request);
        return ResponseEntity.ok(success("Cập nhật khóa học thành công", result));
    }

    @Operation(summary = "Xóa khóa học")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{id}")
    public ResponseEntity<StandardResponse<String>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(success("Xóa khóa học thành công"));
    }
}
