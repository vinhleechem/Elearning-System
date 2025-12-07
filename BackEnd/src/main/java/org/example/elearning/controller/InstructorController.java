package org.example.elearning.controller;

import org.example.elearning.dto.request.UpdateInstructorProfileRequest;
import org.example.elearning.dto.response.ApiResponse;
import org.example.elearning.dto.response.InstructorResponse;
import org.example.elearning.service.InstructorService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/v1/instructors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Instructor", description = "APIs quản lý giảng viên")
public class InstructorController {
    InstructorService instructorService;

    @GetMapping("/{instructorId}")
    @Operation(summary = "Lấy thông tin giảng viên theo ID")
    public ApiResponse<InstructorResponse> getInstructorById(@PathVariable Long instructorId) {
        return ApiResponse.<InstructorResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin giảng viên thành công")
                .data(instructorService.getInstructorById(instructorId))
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Lấy thông tin giảng viên của tôi")
    public ApiResponse<InstructorResponse> getMyInstructorProfile() {
        return ApiResponse.<InstructorResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin giảng viên thành công")
                .data(instructorService.getMyInstructorProfile())
                .build();
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Cập nhật thông tin giảng viên")
    public ApiResponse<InstructorResponse> updateMyInstructorProfile(
            @Valid @RequestBody UpdateInstructorProfileRequest request) {
        return ApiResponse.<InstructorResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật thông tin giảng viên thành công")
                .data(instructorService.updateMyInstructorProfile(request))
                .build();
    }

    @PostMapping("/become")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
    @Operation(summary = "Đăng ký trở thành giảng viên - Bất kỳ user nào đã đăng nhập")
    public ApiResponse<InstructorResponse> becomeInstructor() {
        return ApiResponse.<InstructorResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Đăng ký giảng viên thành công")
                .data(instructorService.becomeInstructor())
                .build();
    }
}
