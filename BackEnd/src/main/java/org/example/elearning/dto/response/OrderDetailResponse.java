package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderDetailResponse {

    // Order Info
    private Long orderId;
    private String orderCode;
    private String status;
    private LocalDateTime createdAt;

    // User Info
    private Long userId;
    private String userFullName;
    private String userEmail;

    // Pricing
    private BigDecimal subtotal; // Tổng gốc (chưa giảm)
    private BigDecimal totalDiscount; // Tổng giảm
    private BigDecimal finalAmount; // Số tiền thực trả

    // Items
    private List<OrderItemDetail> items;

    // Discounts Applied
    private List<DiscountApplied> discountsApplied;

    // Payment
    private PaymentInfo payment;

    @Data
    @Builder
    public static class OrderItemDetail {
        private Long orderItemId;
        private Long courseId;
        private String courseTitle;
        private String courseThumbnail;
        private String instructorName;
        private BigDecimal originalPrice;
        private BigDecimal discountPrice;
        private BigDecimal finalPrice;
        private BigDecimal savings; // Tiết kiệm được
    }

    @Data
    @Builder
    public static class DiscountApplied {
        private String type; // PROMOTION, VOUCHER, COURSE_DISCOUNT
        private String code; // Code (nếu có)
        private String name; // Tên hiển thị
        private String description; // Mô tả
        private BigDecimal amount; // Số tiền giảm
        private LocalDateTime appliedAt; // Thời điểm áp dụng
    }

    @Data
    @Builder
    public static class PaymentInfo {
        private Long paymentId;
        private String method; // VNPay, Momo, COD, etc.
        private String status; // pending, success, failed
        private BigDecimal amount;
        private LocalDateTime paidAt;
        private String transactionId;
    }
}
