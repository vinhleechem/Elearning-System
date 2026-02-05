package org.example.elearning.controller.instructor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.request.CourseUpdateRequest;
import org.example.elearning.dto.request.InstructorCourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.CourseService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/instructor/courses")
@RequiredArgsConstructor
@Tag(name = "Instructor Course Management", description = "APIs quản lý khóa học dành cho giảng viên")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InstructorCourseController {
    CourseService courseService;

    @Operation(summary = "Lấy danh sách khóa học của giảng viên hiện tại")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/my-courses")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<PaginatedResponse<CourseResponse>>> getMyCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PaginatedResponse<CourseResponse> result = courseService.getMyCourses(pageable, search);
        return ResponseEntity.ok(success("Lấy danh sách khóa học thành công", result));
    }

    @Operation(summary = "Tạo khóa học mới")
    @ApiResponse(responseCode = "200", description = "Tạo thành công")
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<CourseResponse>> createCourse(
            @Valid @RequestBody InstructorCourseRequest request) {
        CourseResponse result = courseService.createCourseByInstructor(request);
        return ResponseEntity.ok(success("Tạo khóa học thành công", result));
    }

    @Operation(summary = "Cập nhật khóa học")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseUpdateRequest request) {
        CourseResponse result = courseService.updateCourse(id, request);
        return ResponseEntity.ok(success("Cập nhật khóa học thành công", result));
    }

    @Operation(summary = "Xóa khóa học")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<String>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(success("Xóa khóa học thành công"));
    }

    @Operation(summary = "Gửi yêu cầu duyệt khóa học (Giảng viên)")
    @ApiResponse(responseCode = "200", description = "Gửi yêu cầu thành công")
    @PutMapping("/{id}/submit-approval")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<String>> submitCourseForApproval(@PathVariable Long id) {
        courseService.submitCourseForApproval(id);
        return ResponseEntity.ok(success("Gửi yêu cầu duyệt khóa học thành công"));
    }
}
