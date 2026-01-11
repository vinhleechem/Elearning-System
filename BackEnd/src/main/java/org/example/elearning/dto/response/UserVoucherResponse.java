package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.VoucherSource;
import org.example.elearning.enums.VoucherType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class UserVoucherResponse {
    private Long userVoucherId;
    private Long voucherId;
    private String code;
    private String name;
    private String description;
    private VoucherType voucherType;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private VoucherSource source;
    private LocalDateTime receivedAt;
    private Boolean isUsed;
    private LocalDateTime usedAt;
    private Long orderId;
    private LocalDateTime expiryDate;
    private String status; // AVAILABLE, USED, EXPIRED
}
