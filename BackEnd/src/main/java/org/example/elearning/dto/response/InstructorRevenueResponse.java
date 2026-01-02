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
public class InstructorRevenueResponse {
    private Long instructorId;
    private String instructorName;
    private BigDecimal revenue;
    private Long orderCount;
    private Long courseSales;
    private BigDecimal commissionAmount; // Platform's commission
    private BigDecimal instructorEarnings; // Instructor's net earnings
}
