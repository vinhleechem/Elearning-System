package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.PromotionRuleType;

import java.math.BigDecimal;

@Data
@Builder
public class PromotionRuleResponse {
    private Long ruleId;
    private PromotionRuleType ruleType;
    private Long targetId;
    private String targetName; // Course name hoặc Category name
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minPurchaseAmount;
    private Integer buyQuantity;
    private Integer getQuantity;
}
