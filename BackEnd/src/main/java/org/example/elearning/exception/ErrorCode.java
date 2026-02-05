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
    UNAUTHENTICATED("Bạn chưa đăng nhập", HttpStatus.UNAUTHORIZED.value()),
    INVALID_TOKEN("Token không hợp lệ", HttpStatus.UNAUTHORIZED.value()),

    // Authorization errors
    FORBIDDEN("Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN.value()),
    ADMIN_ACCOUNT_CANNOT_MODIFY("Tài khoản Admin không được tùy chỉnh!", HttpStatus.FORBIDDEN.value()),
    ADMIN_ACCESS_WRONG_ENDPOINT(
            "Vui lòng sử dụng API quản lý hội thoại dành cho Admin",
            HttpStatus.FORBIDDEN.value()
    ),
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

    INVALID_CATEGORY_LEVEL("Danh mục không hợp lệ (phải là cấp 3)", HttpStatus.BAD_REQUEST.value()),

    // Course errors
    COURSE_NOT_FOUND("Khóa học không tìm thấy", HttpStatus.NOT_FOUND.value()),
    COURSE_NOT_PUBLIC("Khóa học chưa được xuất bản", HttpStatus.NOT_FOUND.value()),
    COURSE_ALREADY_ENROLLED("Bạn đã đăng ký khóa học này rồi", HttpStatus.CONFLICT.value()),
    COURSE_NOT_FOUND_LIST("Không tìm thấy khóa học nào", HttpStatus.NOT_FOUND.value()),
    INSTRUCTOR_NOT_ASSIGNED_TO_COURSE("Instructor không phụ trách khóa học này",HttpStatus.FORBIDDEN.value()),

    // Enrollment errors
    ENROLLMENT_NOT_FOUND("Bạn chưa đăng ký khóa học này", HttpStatus.NOT_FOUND.value()),

    //Category errors
    CATEGORY_NOT_FOUND("Danh mục không tìm thấy", HttpStatus.NOT_FOUND.value()),
    CATEGORY_MUST_BE_LEVEL_3("Danh mục phải ở cấp 3", HttpStatus.NOT_FOUND.value()),

    //Instructor errors
    INSTRUCTOR_NOT_FOUND("Giảng viên không tìm thấy", HttpStatus.NOT_FOUND.value()),
    INSTRUCTOR_ALREADY_EXISTS("Giảng viên đã tồn tại", HttpStatus.CONFLICT.value()),

    // Wishlist errors
    COURSE_ALREADY_IN_WISHLIST("Khóa học đã có trong danh sách yêu thích", HttpStatus.CONFLICT.value()),
    COURSE_ALREADY_IN_CART("Khóa học đã có trong giỏ hàng", HttpStatus.CONFLICT.value()),
    CART_ITEM_NOT_FOUND("Khóa học không có trong giỏ hàng", HttpStatus.NOT_FOUND.value()),
    CART_NOT_FOUND("Không tìm thấy giỏ hàng", HttpStatus.NOT_FOUND.value()),
    WISHLIST_ITEM_NOT_FOUND("Item trong wishlist không tìm thấy", HttpStatus.NOT_FOUND.value()),

    // Review errors
    REVIEW_NOT_FOUND("Đánh giá không tồn tại", HttpStatus.NOT_FOUND.value()),
    REVIEW_NOT_ENROLLED("Bạn phải đăng ký khóa học trước khi đánh giá", HttpStatus.FORBIDDEN.value()),
    REVIEW_ALREADY_EXISTS("Bạn đã đánh giá khóa học này rồi", HttpStatus.CONFLICT.value()),

    // Order errors
    ORDER_NOT_FOUND("Đơn hàng không tìm thấy", HttpStatus.NOT_FOUND.value()),
    ORDER_UNAUTHORIZED("Bạn không có quyền truy cập đơn hàng này", HttpStatus.FORBIDDEN.value()),
    ORDER_CANNOT_BE_CANCELLED(
            "Chỉ có thể hủy đơn hàng đang chờ xử lý",
            HttpStatus.CONFLICT.value()
    ),

    // Payment errors
    PAYMENT_NOT_FOUND("Không tìm thấy thông tin thanh toán", HttpStatus.NOT_FOUND.value()),

    // Config errors
    FACEBOOK_CONFIG_MISSING("Facebook OAuth configuration is missing", HttpStatus.INTERNAL_SERVER_ERROR.value()),

    // Promotion errors
    PROMOTION_NOT_FOUND("Promotion không tìm thấy", HttpStatus.NOT_FOUND.value()),
    PROMOTION_ALREADY_EXISTS("Promotion đã tồn tại", HttpStatus.CONFLICT.value()),

    // Voucher errors
    VOUCHER_NOT_FOUND("Voucher không tìm thấy", HttpStatus.NOT_FOUND.value()),
    VOUCHER_CODE_NOT_FOUND("Không tìm thấy voucher với mã này", HttpStatus.NOT_FOUND.value()),
    VOUCHER_ALREADY_EXISTS("Mã voucher đã tồn tại", HttpStatus.CONFLICT.value()),
    VOUCHER_EXPIRED("Voucher đã hết hạn", HttpStatus.CONFLICT.value()),
    VOUCHER_NOT_STARTED("Voucher chưa bắt đầu", HttpStatus.CONFLICT.value()),
    VOUCHER_NOT_ACTIVE("Voucher không còn hoạt động", HttpStatus.CONFLICT.value()),
    VOUCHER_TOTAL_LIMIT_REACHED("Voucher đã hết lượt sử dụng", HttpStatus.CONFLICT.value()),
    VOUCHER_USER_LIMIT_REACHED("Bạn đã sử dụng hết lượt cho voucher này", HttpStatus.CONFLICT.value()),
    VOUCHER_ALREADY_OWNED("Bạn đã sở hữu voucher này", HttpStatus.CONFLICT.value()),
    VOUCHER_ALREADY_USED("Voucher đã được sử dụng", HttpStatus.CONFLICT.value()),
    VOUCHER_MIN_PURCHASE_NOT_MET("Đơn hàng chưa đạt giá trị tối thiểu để sử dụng voucher", HttpStatus.CONFLICT.value()),
    VOUCHER_NOT_APPLICABLE("Voucher không áp dụng được cho đơn hàng này", HttpStatus.CONFLICT.value()),

    // Discount errors
    DISCOUNT_CALCULATION_FAILED("Không thể tính toán giảm giá", HttpStatus.INTERNAL_SERVER_ERROR.value()),
    INVALID_DISCOUNT_VALUE("Giá trị giảm giá không hợp lệ", HttpStatus.BAD_REQUEST.value()),

    //Conversation errors
    CONVERSATION_NOT_FOUND("Không tìm thấy cuộc trò chuyện nào", HttpStatus.NOT_FOUND.value()),

    //Pasword reset errors
    PASSWORD_RESET_TOKEN_USED("Token đặt lại mật khẩu đã được sử dụng",HttpStatus.BAD_REQUEST.value()),
    PASSWORD_RESET_TOKEN_EXPIRED("Token đặt lại mật khẩu đã hết hạn. Vui lòng sử dụng link mới!",HttpStatus.BAD_REQUEST.value()),

    //Message errors
    MESSAGE_NOT_FOUND("Message không tìm thấy", HttpStatus.NOT_FOUND.value()),
    MESSAGE_DELETE_FORBIDDEN("Bạn chỉ có thể xóa message của chính mình", HttpStatus.FORBIDDEN.value()),

    //Lesson errors
    LESSON_NOT_FOUND("Bài học không tìm thấy", HttpStatus.NOT_FOUND.value());



    public String message;
    public int code;

    ErrorCode(String message, int code) {
        this.message = message;
        this.code = code;
    }
}
