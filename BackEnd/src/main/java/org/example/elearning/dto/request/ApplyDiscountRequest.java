package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ApplyDiscountRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotEmpty(message = "Cart items cannot be empty")
    private List<CartItemRequest> cartItems;

    private String voucherCode; // Optional - voucher to apply

    @Data
    public static class CartItemRequest {
        @NotNull(message = "Course ID is required")
        private Long courseId;

        @NotNull(message = "Price is required")
        private java.math.BigDecimal price;
    }
}
