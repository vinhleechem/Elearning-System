package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.SetPasswordRequest;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/password-reset")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PasswordResetController {

    PasswordResetService passwordResetService;

    @Operation(summary = "Request password reset", description = "Send password reset email to user")
    @ApiResponse(responseCode = "200", description = "Email sent successfully")
    @PostMapping("/request")
    public ResponseEntity<StandardResponse<String>> requestPasswordReset(@RequestParam String email) {
        passwordResetService.createPasswordResetToken(email);
        return ResponseEntity.ok(success("Email đặt lại mật khẩu đã được gửi"));
    }

    @Operation(summary = "Validate reset token", description = "Check if token is valid and not expired")
    @ApiResponse(responseCode = "200", description = "Token validation result")
    @GetMapping("/validate")
    public ResponseEntity<StandardResponse<Boolean>> validateToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateToken(token);
        return ResponseEntity.ok(success("Token validation result", isValid));
    }

    @Operation(summary = "Set new password", description = "Set password using reset token")
    @ApiResponse(responseCode = "200", description = "Password set successfully")
    @PostMapping("/set-password")
    public ResponseEntity<StandardResponse<String>> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        passwordResetService.setPassword(request);
        return ResponseEntity.ok(success("Đặt mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ"));
    }
}
