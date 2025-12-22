package org.example.elearning.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // System errors
    SYSTEM_ERROR("Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR.value()),

    // User related errors
    INVALID_CONFIRM_PASSWORD("Confirm password and password do not match", HttpStatus.BAD_REQUEST.value()),
    USER_LOCKED("Tài khoản đã bị khóa", HttpStatus.LOCKED.value()),
    USER_DELETED("User was banned due to violations of our Terms of Service", HttpStatus.FORBIDDEN.value()),
    USER_ALREADY_EXISTS("Người dùng này đã tồn tại trong hệ thống", HttpStatus.CONFLICT.value()),
    USER_NOT_FOUND("Người dùng không tồn tại trong hệ thống", HttpStatus.NOT_FOUND.value()),

    // Authentication errors
    INVALID_CREDENTIALS("Tài khoản hoặc mật khẩu chưa chính xác", HttpStatus.UNAUTHORIZED.value()),
    UNAUTHENTICATED("Bạn chưa đăng nhập hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED.value()),
    INVALID_TOKEN("Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED.value()),
    TOKEN_INCORRECT("Token không hợp lệ", HttpStatus.BAD_REQUEST.value()),

    // Authorization errors
    FORBIDDEN("Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN.value()),
    UNAUTHORIZED_OPERATION("Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN.value()),
    ADMIN_ACCOUNT_CANNOT_MODIFY("Tài khoản ADMIN không được tùy chỉnh!", HttpStatus.FORBIDDEN.value()),

    // Permission errors
    PERMISSION_NOT_FOUND("Permission không tìm thấy", HttpStatus.NOT_FOUND.value()),
    PERMISSION_EXISTED("Permission đã tồn tại", HttpStatus.CONFLICT.value()),

    // Role errors
    ROLE_NOT_FOUND("Role không tìm thấy", HttpStatus.NOT_FOUND.value()),
    ROLE_EXISTED("Role đã tồn tại", HttpStatus.CONFLICT.value()),

    // Validation errors
    INVALID_FILE("File upload không hợp lệ!", HttpStatus.BAD_REQUEST.value()),
    INVALID_PASSWORD("Mật khẩu hiện tại không đúng!", HttpStatus.BAD_REQUEST.value()),
    PASSWORD_MISMATCH("Mật khẩu xác nhận không khớp!", HttpStatus.BAD_REQUEST.value()),

    // File/Image errors
    CLOUDINARY_UPLOAD_FAILED("Không thể upload ảnh lên Cloudinary. Vui lòng thử lại sau!",
            HttpStatus.INTERNAL_SERVER_ERROR.value()),
    USER_NO_AVATAR("Người dùng chưa có avatar!", HttpStatus.NOT_FOUND.value()),

    // Course errors
    COURSE_NOT_FOUND("Khóa học không tìm thấy", HttpStatus.NOT_FOUND.value()),
    COURSE_ALREADY_ENROLLED("Bạn đã đăng ký khóa học này rồi", HttpStatus.CONFLICT.value()),
    COURSE_NOT_FOUND_LIST("Không tìm thấy khóa học nào", HttpStatus.NOT_FOUND.value()),

    // Wishlist errors
    COURSE_ALREADY_IN_WISHLIST("Khóa học đã có trong danh sách yêu thích", HttpStatus.CONFLICT.value()),
    COURSE_ALREADY_IN_CART("Khóa học đã có trong giỏ hàng", HttpStatus.CONFLICT.value()),
    CART_ITEM_NOT_FOUND("Khóa học không có trong giỏ hàng", HttpStatus.NOT_FOUND.value()),
    WISHLIST_ITEM_NOT_FOUND("Item trong wishlist không tìm thấy", HttpStatus.NOT_FOUND.value()),

    // Review errors
    REVIEW_NOT_FOUND("Đánh giá không tìm thấy", HttpStatus.NOT_FOUND.value()),
    REVIEW_UNAUTHORIZED("Bạn không có quyền cập nhật/xóa đánh giá này", HttpStatus.FORBIDDEN.value()),
    REVIEW_NOT_ENROLLED("Bạn phải đăng ký khóa học trước khi đánh giá", HttpStatus.FORBIDDEN.value()),
    REVIEW_ALREADY_EXISTS("Bạn đã đánh giá khóa học này rồi", HttpStatus.CONFLICT.value()),

    // Order errors
    ORDER_NOT_FOUND("Đơn hàng không tìm thấy", HttpStatus.NOT_FOUND.value()),
    ORDER_UNAUTHORIZED("Bạn không có quyền truy cập đơn hàng này", HttpStatus.FORBIDDEN.value()),
    ORDER_CANNOT_CANCEL("Bạn không có quyền hủy đơn hàng này", HttpStatus.FORBIDDEN.value()),

    // Payment errors
    PAYMENT_NOT_FOUND("Không tìm thấy thông tin thanh toán", HttpStatus.NOT_FOUND.value()),

    // Config errors
    FACEBOOK_CONFIG_MISSING("Facebook OAuth configuration is missing", HttpStatus.INTERNAL_SERVER_ERROR.value());

    public String message;
    public int code;

    ErrorCode(String message, int code) {
        this.message = message;
        this.code = code;
    }
}
