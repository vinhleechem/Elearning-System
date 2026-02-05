package org.example.elearning.controller.admin;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.aspect.SecuredEndpoint;
import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.enums.UserStatus;
import org.example.elearning.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin User Management", description = "APIs quản lý người dùng - Dành cho ADMIN")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminUserController {
    UserService userService;

    @Operation(summary = "Lấy danh sách users (phân trang)", description = "API dành cho admin để lấy danh sách user với phân trang và tìm kiếm")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("VIEW_USER")
    public ResponseEntity<StandardResponse<PaginatedResponse<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "false") Boolean deleted,
            @RequestParam(required = false, defaultValue = "ACTIVE") UserStatus status,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        PaginatedResponse<UserResponse> users = userService.getAllUsers(pageable, search, status, deleted);
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
                                                                     @Valid @RequestBody UserUpdateRequest userRequest)
    {
        UserResponse user = userService.updateUserById(id, userRequest);
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
        UserResponse user = userService.assignRolesToUser(id, roleNames);
        return ResponseEntity.ok(success("Gán roles thành công", user));
    }

    @Operation(summary = "Reset password user", description = "API cho admin reset mật khẩu của user")
    @ApiResponse(responseCode = "200", description = "Reset thành công")
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("UPDATE_USER")
    public ResponseEntity<StandardResponse<String>> resetPassword(@PathVariable Long id) {
        String newPassword = userService.resetUserPassword(id);
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
        UserResponse user = userService.uploadAvatarForUser(id, file);
        return ResponseEntity.ok(success("Cập nhật avatar user thành công", user));
    }

    @Operation(summary = "Import user từ Excel", description = "API import danh sách user từ file Excel (Admin)")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("ADD_USER")
    public ResponseEntity<StandardResponse<String>> importUsers(@RequestParam("file") MultipartFile file) {
        try {
            userService.importUsersFromExcel(file);
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
            byte[] data = userService.exportUsersToExcel();
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
