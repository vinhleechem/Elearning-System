package org.example.elearning.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.request.CourseUpdateRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.StandardResponse;
import static org.example.elearning.dto.response.StandardResponse.success;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.enums.CourseLevel;
import org.example.elearning.service.CourseService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CourseController {

    CourseService courseService;

    @Operation(summary = "Lấy danh sách khóa học (public)")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping
    public ResponseEntity<StandardResponse<PaginatedResponse<CourseResponse>>> getCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) CourseLevel level,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating) {
        Pageable pageable = PageRequest.of(page, size);
        PaginatedResponse<CourseResponse> result = courseService.getPublicCourses(
            pageable, search, categoryId, level, minPrice, maxPrice, minRating);
        return ResponseEntity.ok(success("Lấy danh sách khóa học thành công", result));
    }

    @Operation(summary = "Lấy chi tiết khóa học theo ID")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse<CourseResponse>> getCourseInfoById(@PathVariable Long id) {
        CourseResponse result = courseService.getCourseByIdForPublic(id);
        return ResponseEntity.ok(success("Lấy khóa học thành công", result));
    }


    @Operation(summary = "Cập nhật trạng thái khóa học")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<CourseResponse>> updateCourseStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body) {
            
        CourseStatus status = CourseStatus.valueOf(body.get("status"));
        CourseResponse result = courseService.updateCourseStatus(id, status);
        return ResponseEntity.ok(success("Cập nhật trạng thái thành công", result));
    }
}
