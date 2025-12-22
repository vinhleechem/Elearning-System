package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.OrderDiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "order_discounts")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDiscountEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_discount_id")
    Long orderDiscountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    OrderEntity order;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    OrderDiscountType discountType;

    @Column(name = "reference_id")
    Long referenceId; // ID của promotion, voucher, hoặc discount

    @Column(name = "discount_amount", precision = 10, scale = 2, nullable = false)
    BigDecimal discountAmount;

    @Column(name = "applied_at")
    @Builder.Default
    LocalDateTime appliedAt = LocalDateTime.now();

    @Column(name = "description")
    String description; // Mô tả chi tiết (VD: "Flash Sale 50%", "Voucher WELCOME2024")
}
