package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.elearning.enums.VoucherSource;

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
