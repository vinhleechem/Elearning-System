package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.PromotionType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "promotions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_id")
    Long promotionId;

    @Column(name = "name", nullable = false, length = 255)
    String name;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "promotion_type", nullable = false)
    @Builder.Default
    PromotionType promotionType = PromotionType.SEASONAL;

    @Column(name = "start_date", nullable = false)
    LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    LocalDateTime endDate;

    @Column(name = "is_active")
    @Builder.Default
    Boolean isActive = true;

    @Column(name = "priority")
    @Builder.Default
    Integer priority = 0;

    // Relationship với PromotionRule
    @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<PromotionRuleEntity> rules = new ArrayList<>();
}
