package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.SectionRequest;
import org.example.elearning.dto.response.SectionResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.SectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/sections")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SectionController {

    SectionService sectionService;

    @Operation(summary = "Lấy danh sách section của khóa học")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping
    public ResponseEntity<StandardResponse<List<SectionResponse>>> getSections(@PathVariable Long courseId) {
        List<SectionResponse> result = sectionService.getSectionsByCourse(courseId);
        return ResponseEntity.ok(success("Lấy danh sách section thành công", result));
    }

    @Operation(summary = "Tạo section mới cho khóa học")
    @ApiResponse(responseCode = "200", description = "Tạo thành công")
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<SectionResponse>> createSection(
            @PathVariable Long courseId,
            @Valid @RequestBody SectionRequest request) {
        SectionResponse result = sectionService.createSection(courseId, request);
        return ResponseEntity.ok(success("Tạo section thành công", result));
    }

    @Operation(summary = "Cập nhật section")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{sectionId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<SectionResponse>> updateSection(
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @Valid @RequestBody SectionRequest request) {
        SectionResponse result = sectionService.updateSection(sectionId, request);
        return ResponseEntity.ok(success("Cập nhật section thành công", result));
    }

    @Operation(summary = "Xóa section")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{sectionId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<String>> deleteSection(
            @PathVariable Long courseId,
            @PathVariable Long sectionId) {
        sectionService.deleteSection(sectionId);
        return ResponseEntity.ok(success("Xóa section thành công"));
    }
}
