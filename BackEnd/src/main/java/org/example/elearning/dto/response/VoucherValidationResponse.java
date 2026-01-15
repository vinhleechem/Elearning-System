package org.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherValidationResponse {
    
    private boolean valid;
    private String message;
    private String voucherCode;
    private String voucherName;
    
    // Discount info (if valid)
    private BigDecimal discountAmount;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    
    // Validation details
    private List<String> reasons; // Why invalid (if applicable)
    private ValidationStatus status;
    
    public enum ValidationStatus {
        VALID,
        EXPIRED,
        NOT_STARTED,
        USAGE_LIMIT_REACHED,
        MIN_ORDER_NOT_MET,
        NOT_APPLICABLE,
        ALREADY_USED,
        NOT_FOUND,
        INACTIVE
    }
    
    // Helper methods for common responses
    public static VoucherValidationResponse valid(String code, String name, BigDecimal discount) {
        return VoucherValidationResponse.builder()
                .valid(true)
                .status(ValidationStatus.VALID)
                .voucherCode(code)
                .voucherName(name)
                .discountAmount(discount)
                .message("Voucher is valid and can be applied")
                .build();
    }
    
    public static VoucherValidationResponse invalid(String code, ValidationStatus status, String message, List<String> reasons) {
        return VoucherValidationResponse.builder()
                .valid(false)
                .status(status)
                .voucherCode(code)
                .message(message)
                .reasons(reasons)
                .build();
    }
}
