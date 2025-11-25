package org.example.elearning.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    SYSTEM_ERROR( "Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR.value()),

    INVALID_CONFIRM_PASSWORD("Confirm password and password do not match", HttpStatus.BAD_REQUEST.value()),
    USER_LOCKED( "Tài khoản đã bị khóa", HttpStatus.LOCKED.value()),
    USER_DELETED("User was banned due to violations of our Terms of Service", HttpStatus.FORBIDDEN.value()),
    USER_ALREADY_EXISTS("Người dùng này đã tồn tại trong hệ thống", HttpStatus.CONFLICT.value()),
    USER_NOT_FOUND("Người dùng không tồn tại trong hệ thống", HttpStatus.NOT_FOUND.value()),

    // Khi login sai username/password
    INVALID_CREDENTIALS("Tài khoản hoặc mật khẩu chưa chính xác", HttpStatus.UNAUTHORIZED.value()),
    // Khi request khác mà JWT không hợp lệ / thiếu / hết hạn
    UNAUTHENTICATED("Bạn chưa đăng nhập hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED.value()),
    FORBIDDEN("Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN.value()),
    TOKEN_INCORRECT("Token không hợp lệ", HttpStatus.BAD_REQUEST.value()),

    PERMISSION_NOT_FOUND("Permission không tìm thấy", HttpStatus.NOT_FOUND.value()),
    PERMISSION_EXISTED("Permission đã tồn tại", HttpStatus.CONFLICT.value()),

    ROLE_NOT_FOUND("Role không tìm thấy", HttpStatus.NOT_FOUND.value()),
    ROLE_EXISTED("Role đã tồn tại", HttpStatus.CONFLICT.value());

    public String message;
    public int code;

    ErrorCode(String message, int code) {
        this.message = message;
        this.code = code;
    }
}
