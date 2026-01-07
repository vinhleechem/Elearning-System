package org.example.elearning.controller;

import java.util.List;

import org.example.elearning.aspect.SecuredEndpoint;
import org.example.elearning.dto.request.ChangePasswordRequest;
import org.example.elearning.dto.request.UpdateProfileRequest;
import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.StandardResponse;
import static org.example.elearning.dto.response.StandardResponse.success;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    // ==================== USER ENDPOINTS (Authenticated Users)
    // ====================

    @Operation(summary = "Lấy thông tin profile", description = "API lấy thông tin người dùng hiện tại")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/me")
    public ResponseEntity<StandardResponse<UserResponse>> getCurrentUser() {
        UserResponse user = userService.getMyInfo();
        return ResponseEntity.ok(success("Lấy thông tin người dùng thành công", user));
    }

    @Operation(summary = "Cập nhật profile", description = "API cho user tự cập nhật thông tin cá nhân")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/me")
    public ResponseEntity<StandardResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse user = userService.updateMyProfile(request);
        return ResponseEntity.ok(success("Cập nhật profile thành công", user));
    }

    @Operation(summary = "Đổi mật khẩu", description = "API cho user tự đổi mật khẩu")
    @ApiResponse(responseCode = "200", description = "Đổi mật khẩu thành công")
    @PostMapping("/change-password")
    public ResponseEntity<StandardResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(success("Đổi mật khẩu thành công"));
    }

    @Operation(summary = "Upload avatar", description = "API cho user tự upload ảnh đại diện")
    @ApiResponse(responseCode = "200", description = "Upload thành công")
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StandardResponse<UserResponse>> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        UserResponse user = userService.uploadAvatar(file);
        return ResponseEntity.ok(success("Upload avatar thành công", user));
    }

    @Operation(summary = "Xóa avatar", description = "API cho user xóa ảnh đại diện")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/me/avatar")
    public ResponseEntity<StandardResponse<String>> deleteAvatar() {
        userService.deleteAvatar();
        return ResponseEntity.ok(success("Xóa avatar thành công"));
    }

    // ==================== ADMIN ENDPOINTS ====================

    @Operation(summary = "Lấy danh sách users (phân trang)", description = "API dành cho admin để lấy danh sách user với phân trang và tìm kiếm")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("VIEW_USER")
    public ResponseEntity<StandardResponse<PaginatedResponse<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) String search) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PaginatedResponse<UserResponse> users = userService.getAllUsers(pageable, search);
        return ResponseEntity.ok(success("Lấy danh sách users thành công", users));
    }

    @Operation(summary = "Lấy chi tiết user", description = "API cho admin xem thông tin chi tiết của một user")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("VIEW_USER")
    public ResponseEntity<StandardResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(success("Lấy thông tin user thành công", user));
    }

    @Operation(summary = "Tạo user mới", description = "API cho admin thêm user mới vào hệ thống")
    @ApiResponse(responseCode = "200", description = "Tạo user thành công")
    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("ADD_USER")
    public ResponseEntity<StandardResponse<UserResponse>> addUser(@Valid @RequestBody UserCreateRequest userRequest) {
        UserResponse user = userService.createUser(userRequest);
        return ResponseEntity.ok(success("Tạo user thành công", user));
    }

    @Operation(summary = "Cập nhật thông tin user", description = "API cho admin chỉnh sửa thông tin của user theo ID")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("UPDATE_USER")
    public ResponseEntity<StandardResponse<UserResponse>> updateUser(@PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest userRequest) {
        UserResponse user = userService.updateUser(id, userRequest);
        return ResponseEntity.ok(success("Cập nhật user thành công", user));
    }

    @Operation(summary = "Xóa user (soft delete)", description = "API cho admin xóa user theo ID (đánh dấu deleted)")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("DELETE_USER")
    public ResponseEntity<StandardResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(success("Xóa user thành công"));
    }

    @Operation(summary = "Khôi phục user", description = "API cho admin khôi phục user đã bị xóa theo ID")
    @ApiResponse(responseCode = "200", description = "Khôi phục thành công")
    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("UPDATE_USER")
    public ResponseEntity<StandardResponse<String>> restoreUser(@PathVariable Long id) {
        userService.restoreUser(id);
        return ResponseEntity.ok(success("Khôi phục user thành công"));
    }

    @Operation(summary = "Khóa/Mở khóa user", description = "API cho admin khóa hoặc mở khóa tài khoản user")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("UPDATE_USER")
    public ResponseEntity<StandardResponse<UserResponse>> toggleUserStatus(@PathVariable Long id) {
        UserResponse user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(success("Cập nhật trạng thái user thành công", user));
    }

    @Operation(summary = "Gán roles cho user", description = "API cho admin gán hoặc thay đổi roles của user")
    @ApiResponse(responseCode = "200", description = "Gán roles thành công")
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("UPDATE_USER")
    public ResponseEntity<StandardResponse<UserResponse>> assignRoles(
            @PathVariable Long id,
            @RequestBody List<String> roleNames) {
        UserResponse user = userService.assignRoles(id, roleNames);
        return ResponseEntity.ok(success("Gán roles thành công", user));
    }

    @Operation(summary = "Reset password user", description = "API cho admin reset mật khẩu của user")
    @ApiResponse(responseCode = "200", description = "Reset thành công")
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("UPDATE_USER")
    public ResponseEntity<StandardResponse<String>> resetPassword(@PathVariable Long id) {
        String newPassword = userService.resetPassword(id);
        return ResponseEntity.ok(success("Reset password thành công. Mật khẩu mới: " + newPassword));
    }

    @Operation(summary = "Cập nhật avatar user", description = "API cho admin cập nhật avatar cho user cụ thể")
    @ApiResponse(responseCode = "200", description = "Cập nhật avatar thành công")
    @PostMapping("/{id}/avatar")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("UPDATE_USER")
    public ResponseEntity<StandardResponse<UserResponse>> updateUserAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        UserResponse user = userService.updateUserAvatar(id, file);
        return ResponseEntity.ok(success("Cập nhật avatar user thành công", user));
    }

    @Operation(summary = "Import user từ Excel", description = "API import danh sách user từ file Excel (Admin)")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("ADD_USER")
    public ResponseEntity<StandardResponse<String>> importUsers(@RequestParam("file") MultipartFile file) {
         try {
            userService.importUsers(file);
            return ResponseEntity.ok(success("Import users thành công"));
        } catch (java.io.IOException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error("Lỗi khi đọc file: " + e.getMessage()));
        }
    }

    @Operation(summary = "Export danh sách users ra Excel", description = "API export danh sách users ra file Excel (Admin)")
    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("VIEW_USER")
    public ResponseEntity<byte[]> exportUsers() {
        try {
            byte[] data = userService.exportUsers();
            String filename = "users_" + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (java.io.IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
