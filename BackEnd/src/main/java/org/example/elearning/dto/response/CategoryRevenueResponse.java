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
public class CategoryRevenueResponse {
    private Long categoryId;
    private String categoryName;
    private BigDecimal revenue;
    private Long orderCount;
    private Double percentage; // Percentage of total revenue
}
