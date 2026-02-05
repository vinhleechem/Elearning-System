package org.example.elearning.controller.user;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.elearning.dto.request.ChangePasswordRequest;
import org.example.elearning.dto.request.UpdateProfileRequest;
import org.example.elearning.dto.response.StandardResponse;
import static org.example.elearning.dto.response.StandardResponse.success;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
@Tag(name = "User Profile Management", description = "APIs quản lý profile người dùng")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @Operation(summary = "Lấy thông tin profile", description = "API lấy thông tin người dùng hiện tại")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping
    public ResponseEntity<StandardResponse<UserResponse>> getCurrentUser() {
        UserResponse user = userService.getMyProfile();
        return ResponseEntity.ok(success("Lấy thông tin người dùng thành công", user));
    }

    @Operation(summary = "Cập nhật profile", description = "API cho user tự cập nhật thông tin cá nhân")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping
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
        userService.changeMyPassword(request);
        return ResponseEntity.ok(success("Đổi mật khẩu thành công"));
    }

    @Operation(summary = "Upload avatar", description = "API cho user tự upload ảnh đại diện")
    @ApiResponse(responseCode = "200", description = "Upload thành công")
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StandardResponse<UserResponse>> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        UserResponse user = userService.uploadMyAvatar(file);
        return ResponseEntity.ok(success("Upload avatar thành công", user));
    }

    @Operation(summary = "Xóa avatar", description = "API cho user xóa ảnh đại diện")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/avatar")
    public ResponseEntity<StandardResponse<String>> deleteAvatar() {
        userService.deleteMyAvatar();
        return ResponseEntity.ok(success("Xóa avatar thành công"));
    }

}
