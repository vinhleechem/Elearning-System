package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.*;
import org.example.elearning.dto.response.RefreshTokenResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.dto.response.IntrospectResponse;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.example.elearning.dto.response.StandardResponse.success;

@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    AuthenticationService authenticationService;

    @Operation(summary = "Đăng ký tài khoản", description = "API cho phép người dùng mới đăng ký tài khoản vào hệ thống")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Đăng ký thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    })
    @PostMapping("/register")
    public ResponseEntity<StandardResponse<Object>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authenticationService.register(request);
        return ResponseEntity.ok(success("Đăng ký thành công", user));
    }

    @Operation(summary = "Đăng nhập", description = "API đăng nhập và trả về access token + refresh token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
            @ApiResponse(responseCode = "401", description = "Sai tài khoản hoặc mật khẩu")
    })
    @PostMapping("/login")
    public ResponseEntity<StandardResponse<Object>> login(@Valid @RequestBody UserLoginRequest userRequest) {
        UserResponse.UserLoginResponse result = authenticationService.login(userRequest);
        return ResponseEntity.ok(success("Đăng nhập thành công", result));
    }

    @Operation(summary = "Introspect token", description = "Kiểm tra token có hợp lệ hay không")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token hợp lệ"),
            @ApiResponse(responseCode = "401", description = "Token không hợp lệ hoặc đã hết hạn")
    })
    @PostMapping("/introspect")
    public ResponseEntity<StandardResponse<Object>> introspect(@RequestBody IntrospectRequest introspectRequest) {
        IntrospectResponse result = authenticationService.introspect(introspectRequest);
        return ResponseEntity.ok(success("Kiểm tra token thành công", result));
    }

    @Operation(summary = "Đăng xuất", description = "API đăng xuất và vô hiệu hóa refresh token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Đăng xuất thành công"),
            @ApiResponse(responseCode = "401", description = "Token không hợp lệ")
    })
    @PostMapping("/logout")
    public ResponseEntity<StandardResponse<String>> logout(@RequestBody LogoutRequest logoutRequest) {
        authenticationService.logout(logoutRequest);
        return ResponseEntity.ok(success("Đăng xuất thành công"));
    }

    @Operation(summary = "Làm mới token", description = "API lấy access token mới bằng refresh token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Làm mới token thành công"),
            @ApiResponse(responseCode = "401", description = "Refresh token hết hạn hoặc không hợp lệ")
    })
    @PostMapping("/refresh")
    public ResponseEntity<StandardResponse<Object>> refresh(@RequestBody RefreshTokenRequest refreshRequest) {
        RefreshTokenResponse result = authenticationService.refreshToken(refreshRequest);
        return ResponseEntity.ok(success("Làm mới token thành công", result));
    }

    @Operation(summary = "Đăng nhập với Google", description = "API login thông qua Google OAuth2 (sử dụng authorization code)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Đăng nhập Google thành công"),
            @ApiResponse(responseCode = "401", description = "Không xác thực được với Google")
    })
    @PostMapping("/login-google")
    public ResponseEntity<StandardResponse<Object>> loginGoogle(@RequestParam("code") String code) {
        UserResponse.UserLoginResponse result = authenticationService.outboundAuthentication(code);
        return ResponseEntity.ok(success("Đăng nhập Google thành công", result));
    }
}
