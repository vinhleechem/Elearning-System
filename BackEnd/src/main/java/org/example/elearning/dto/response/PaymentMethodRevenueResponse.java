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
public class PaymentMethodRevenueResponse {
    private String paymentMethod;
    private BigDecimal revenue;
    private Long transactionCount;
    private Double percentage;
}
