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
public class RevenueStatsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal monthRevenue;
    private BigDecimal todayRevenue;
    private Long totalOrders;
    private Long monthOrders;
    private Long todayOrders;
    private Double growthRate; // Percentage growth compared to last period
    private BigDecimal averageOrderValue;
}
