package org.example.elearning.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionRateRequest {
    
    @NotNull(message = "Instructor ID is required")
    private Long instructorId;
    
    @NotNull(message = "Rate percentage is required")
    @DecimalMin(value = "0.00", message = "Rate must be at least 0")
    @DecimalMax(value = "100.00", message = "Rate cannot exceed 100")
    private BigDecimal ratePercentage;
    
    private BigDecimal minPayoutAmount;
    
    private Boolean isActive;
    
    private String notes;
}
