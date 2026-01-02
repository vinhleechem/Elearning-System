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
public class MonthlyRevenueResponse {
    private Integer year;
    private Integer month;
    private Integer quarter; // For quarterly reports
    private BigDecimal revenue;
    private Long orderCount;
    private String period; // e.g., "Jan 2026" or "Q1 2026"
}
