package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.VoucherApplicability;
import org.example.elearning.enums.VoucherType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VoucherResponse {
    private Long voucherId;
    private String code;
    private String name;
    private String description;
    private VoucherType voucherType;
    private String instructorName; // If instructor voucher
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private Integer totalUsageLimit;
    private Integer perUserLimit;
    private Integer usedCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private VoucherApplicability applicableTo;
    private Integer applicableCoursesCount;
    private List<Long> applicableCourseIds;
    private List<Long> applicableCategoryIds;
    private LocalDateTime createdAt;
}
