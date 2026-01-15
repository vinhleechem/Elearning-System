package org.example.elearning.repository;

import org.example.elearning.entity.OrderDiscountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderDiscountRepository extends JpaRepository<OrderDiscountEntity, Long> {

    // Tìm all discounts của order
    List<OrderDiscountEntity> findByOrder_OrderIdAndIsDeletedFalse(Long orderId);
    
    // Tìm all discounts của order (by entity)
    List<OrderDiscountEntity> findByOrder(org.example.elearning.entity.OrderEntity order);

    // Tính tổng discount của order
    @Query("SELECT COALESCE(SUM(od.discountAmount), 0) " +
            "FROM OrderDiscountEntity od " +
            "WHERE od.order.orderId = :orderId " +
            "AND od.isDeleted = false")
    BigDecimal calculateTotalDiscountForOrder(@Param("orderId") Long orderId);
}
