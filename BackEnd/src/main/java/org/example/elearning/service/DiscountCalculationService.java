package org.example.elearning.service;

import org.example.elearning.dto.request.ApplyDiscountRequest;
import org.example.elearning.dto.response.DiscountCalculationResponse;
import org.example.elearning.entity.OrderEntity;

import java.util.List;

public interface DiscountCalculationService {

    /**
     * Calculate discount for cart items
     * Applies active promotions and optional voucher
     */
    DiscountCalculationResponse calculateDiscount(ApplyDiscountRequest request);

    /**
     * Apply discount to order and create order discount records
     */
    void applyDiscountToOrder(OrderEntity order, String voucherCode);

    /**
     * Get available discounts for user
     */
    List<String> getAvailableDiscounts(Long userId);
}
