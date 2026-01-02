package org.example.elearning.dto.response;

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
public class InstructorPayoutResponse {
    private Long payoutId;
    private Long instructorId;
    private String instructorName;
    private BigDecimal amount;
    private BigDecimal commissionAmount;
    private BigDecimal netAmount;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private PayoutStatus status;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private String notes;
}
