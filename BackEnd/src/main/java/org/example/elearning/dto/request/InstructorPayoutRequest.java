package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.elearning.enums.PayoutStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorPayoutRequest {
    
    @NotNull(message = "Instructor ID is required")
    private Long instructorId;
    
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    
    @NotNull(message = "Period start is required")
    private LocalDateTime periodStart;
    
    @NotNull(message = "Period end is required")
    private LocalDateTime periodEnd;
    
    private String paymentMethod;
    
    private String transactionId;
    
    private String notes;
}
