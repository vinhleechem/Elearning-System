package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "commission_rates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommissionRateEntity extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rate_id")
    Long rateId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    InstructorEntity instructor;
    
    @Column(name = "rate_percentage", precision = 5, scale = 2, nullable = false)
    BigDecimal ratePercentage; // e.g., 70.00 means instructor gets 70%
    
    @Column(name = "min_payout_amount", precision = 10, scale = 2)
    BigDecimal minPayoutAmount; // Minimum amount before payout
    
    @Column(name = "is_active", nullable = false)
    Boolean isActive;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    String notes;
}
