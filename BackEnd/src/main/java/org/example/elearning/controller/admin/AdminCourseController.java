package org.example.elearning.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.AdminCourseRequest;
import org.example.elearning.dto.request.CourseUpdateRequest;
import org.example.elearning.dto.request.InstructorCourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.service.CourseService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/admin/courses")
@RequiredArgsConstructor
@Tag(name ="Admin Course Management", description = "APIs quản lý khóa học - Dành cho ADMIN")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminCourseController {
    CourseService courseService;

    @Operation(summary = "Lấy danh sách tất cả khóa học (Admin)")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponse<PaginatedResponse<CourseResponse>>> getAllCoursesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CourseStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        PaginatedResponse<CourseResponse> courses = courseService.getAllCoursesForAdmin(pageable, search, status);
        return ResponseEntity.ok(success("Lấy danh sách khóa học thành công", courses));
    }

    @Operation(summary = "Chuyển giảng viên cho khóa học (Admin)")
    @ApiResponse(responseCode = "200", description = "Chuyển giảng viên thành công")
    @PutMapping("/{id}/reassign-instructor")
    public ResponseEntity<StandardResponse<CourseResponse>> reassignInstructor(
            @PathVariable Long id,
            @RequestParam Long newInstructorId) {
        CourseResponse result = courseService.reassignCourseInstructor(id, newInstructorId);
        return ResponseEntity.ok(success("Chuyển giảng viên thành công", result));
    }

    @Operation(summary = "Lấy chi tiết khóa học theo ID (Admin)")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        CourseResponse result = courseService.getCourseByIdForAdmin(id);
        return ResponseEntity.ok(success("Lấy khóa học thành công", result));
    }

    @Operation(summary = "Tạo khóa học mới")
    @ApiResponse(responseCode = "200", description = "Tạo thành công")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<StandardResponse<CourseResponse>> createCourse(
            @Valid @RequestBody AdminCourseRequest request) {
        CourseResponse result = courseService.createCourseByAdmin(request);
        return ResponseEntity.ok(success("Tạo khóa học thành công", result));
    }

    @Operation(summary = "Cập nhật khóa học")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<StandardResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseUpdateRequest request) {
        CourseResponse result = courseService.updateCourse(id, request);
        return ResponseEntity.ok(success("Cập nhật khóa học thành công", result));
    }

    @Operation(summary = "Xóa khóa học")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<StandardResponse<String>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(success("Xóa khóa học thành công"));
    }

    @Operation(summary = "Lấy chi tiết khóa học theo slug")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{slug}")
    public ResponseEntity<StandardResponse<CourseResponse>> getCourseBySlug(@PathVariable String slug) {
        CourseResponse result = courseService.getCourseBySlug(slug);
        return ResponseEntity.ok(success("Lấy khóa học thành công", result));
    }
    @Operation(summary = "Import khóa học từ Excel (Admin/Instructor)")
    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<StandardResponse<String>> importCourses(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            courseService.importCourses(file);
            return ResponseEntity.ok(success("Import khóa học thành công"));
        } catch (java.io.IOException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error("Lỗi khi đọc file: " + e.getMessage()));
        }
    }

    @Operation(summary = "Duyệt khóa học (Admin)")
    @ApiResponse(responseCode = "200", description = "Duyệt thành công")
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponse<String>> approveCourse(@PathVariable Long id) {
        courseService.approveCourse(id);
        return ResponseEntity.ok(success("Duyệt khóa học thành công"));
    }

    @Operation(summary = "Từ chối khóa học (Admin)")
    @ApiResponse(responseCode = "200", description = "Từ chối thành công")
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponse<String>> rejectCourse(
            @PathVariable Long id,
            @RequestParam String reason) {
        courseService.rejectCourse(id, reason);
        return ResponseEntity.ok(success("Từ chối khóa học thành công"));
    }

    @Operation(summary = "Export danh sách khóa học ra Excel (Admin/Instructor)")
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<byte[]> exportCourses() {
        try {
            byte[] data = courseService.exportCourses();
            String filename = "courses_" + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (java.io.IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
