package org.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.elearning.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long paymentId;
    private Long orderId;
    private BigDecimal amount;
    private String method;
    private PaymentStatus status;
    private LocalDateTime createdAt;

    // Additional fields for VNPay flow
    private String code;
    private String message;
    private String paymentUrl;
    private String redirectUrl;
}
