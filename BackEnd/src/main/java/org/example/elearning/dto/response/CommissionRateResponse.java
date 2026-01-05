package org.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionRateResponse {
    private Long rateId;
    private Long instructorId;
    private String instructorName;
    private BigDecimal ratePercentage;
    private BigDecimal minPayoutAmount;
    private Boolean isActive;
    private String notes;
}
