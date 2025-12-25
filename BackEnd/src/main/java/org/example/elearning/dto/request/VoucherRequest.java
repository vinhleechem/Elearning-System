package org.example.elearning.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.VoucherApplicability;
import org.example.elearning.enums.VoucherType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class VoucherRequest {

    @NotBlank(message = "Voucher code is required")
    private String code;

    @NotBlank(message = "Voucher name is required")
    private String name;

    private String description;

    @NotNull(message = "Voucher type is required")
    private VoucherType voucherType;

    private Long instructorId; // Nullable - null = system voucher

    private Long promotionId; // Nullable - link to promotion

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;

    private BigDecimal minOrderValue;

    @Min(value = 1, message = "Total usage limit must be at least 1")
    private Integer totalUsageLimit;

    @Min(value = 1, message = "Per user limit must be at least 1")
    private Integer perUserLimit = 1;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private Boolean isActive = true;

    @NotNull(message = "Applicable to is required")
    private VoucherApplicability applicableTo;

    private List<Long> applicableCourseIds = new ArrayList<>(); // For SPECIFIC_COURSES
}
