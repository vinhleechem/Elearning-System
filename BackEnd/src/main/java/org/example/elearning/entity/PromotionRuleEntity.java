package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.PromotionRuleType;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "promotion_rules")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionRuleEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    Long ruleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    PromotionEntity promotion;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    PromotionRuleType ruleType;

    @Column(name = "target_id")
    Long targetId; // ID của course hoặc category (tùy vào ruleType)

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    @Builder.Default
    DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(name = "discount_value", precision = 10, scale = 2)
    BigDecimal discountValue; // 20 (20%) hoặc 100000 (100k VND)

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    BigDecimal maxDiscountAmount; // Giới hạn giảm tối đa (cho PERCENTAGE)

    @Column(name = "min_purchase_amount", precision = 10, scale = 2)
    BigDecimal minPurchaseAmount; // Giá trị đơn hàng tối thiểu

    @Column(name = "buy_quantity")
    Integer buyQuantity; // Cho BUY_X_GET_Y

    @Column(name = "get_quantity")
    Integer getQuantity; // Cho BUY_X_GET_Y
}
