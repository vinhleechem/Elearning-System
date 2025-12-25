package org.example.elearning.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.PromotionRuleType;

import java.math.BigDecimal;

@Data
public class PromotionRuleRequest {

    @NotNull(message = "Rule type is required")
    private PromotionRuleType ruleType;

    private Long targetId; // Course ID hoặc Category ID

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;

    private BigDecimal minPurchaseAmount;

    @Min(value = 1, message = "Buy quantity must be at least 1")
    private Integer buyQuantity;

    @Min(value = 1, message = "Get quantity must be at least 1")
    private Integer getQuantity;
}
