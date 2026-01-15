package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherValidationRequest {
    
    @NotBlank(message = "Voucher code is required")
    private String voucherCode;
    
    @NotNull(message = "Cart items are required")
    private List<CartItem> cartItems;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItem {
        @NotNull(message = "Course ID is required")
        private Long courseId;
        
        @NotNull(message = "Price is required")
        private BigDecimal price;
    }
}
