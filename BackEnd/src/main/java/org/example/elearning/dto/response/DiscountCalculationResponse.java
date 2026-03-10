package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DiscountCalculationResponse {
    private BigDecimal subtotal;
    private BigDecimal totalDiscount;
    private BigDecimal finalAmount;
    private List<DiscountDetail> discounts;
    private List<ItemPrice> itemPrices;

    @Data
    @Builder
    public static class DiscountDetail {
        private String type; // PROMOTION, VOUCHER
        private Long referenceId; // ID của promotion hoặc voucher
        private String name;
        private String description;
        private BigDecimal amount;
    }

    @Data
    @Builder
    public static class ItemPrice {
        private Long courseId;
        private String courseName;
        private BigDecimal originalPrice;
        private BigDecimal discountPrice;
        private BigDecimal finalPrice;
        private BigDecimal savings;
    }
}
