package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "promotions")
@FieldDefaults(level = AccessLevel.PRIVATE)

public class PromotionEntity extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_id")
    Long promotionId;

    @Column(name = "name", nullable = false, length = 100)
    String name;

    @Lob
    @Column(name = "description")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    @Builder.Default
    DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(name = "discount_value", precision = 10, scale = 2)
    BigDecimal discountValue;

    @Column(name = "max_uses")
    Integer maxUses;

    @Column(name = "start_date")
    LocalDateTime startDate;

    @Column(name = "end_date")
    LocalDateTime endDate;
}
