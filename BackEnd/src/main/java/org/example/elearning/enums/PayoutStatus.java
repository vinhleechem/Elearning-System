package org.example.elearning.enums;

public enum PayoutStatus {
    PENDING,    // Chờ xử lý
    PROCESSING, // Đang xử lý
    COMPLETED,  // Đã thanh toán
    FAILED,     // Thất bại
    CANCELLED   // Đã hủy
}
