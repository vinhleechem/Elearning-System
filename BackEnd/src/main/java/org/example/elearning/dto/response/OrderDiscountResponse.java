package org.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.elearning.enums.OrderDiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDiscountResponse {
    private Long orderDiscountId;
    private OrderDiscountType type;
    private Long referenceId;
    private BigDecimal amount;
    private String description;
    private LocalDateTime appliedAt;
}
