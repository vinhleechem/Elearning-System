package org.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountImpactResponse {
    private BigDecimal totalBeforeDiscount;
    private BigDecimal totalDiscount;
    private BigDecimal totalAfterDiscount;
    private Long orderCount;
    private Long ordersWithDiscount;
    private Double discountPercentage;
    private Double orderDiscountRate; // % orders that used discount
}
