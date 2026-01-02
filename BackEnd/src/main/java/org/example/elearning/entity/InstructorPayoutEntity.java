package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.PayoutStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "instructor_payouts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InstructorPayoutEntity extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payout_id")
    Long payoutId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    InstructorEntity instructor;
    
    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    BigDecimal amount;
    
    @Column(name = "commission_amount", precision = 10, scale = 2, nullable = false)
    BigDecimal commissionAmount; // Platform's commission
    
    @Column(name = "net_amount", precision = 10, scale = 2, nullable = false)
    BigDecimal netAmount; // Amount paid to instructor
    
    @Column(name = "period_start", nullable = false)
    LocalDateTime periodStart;
    
    @Column(name = "period_end", nullable = false)
    LocalDateTime periodEnd;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    PayoutStatus status;
    
    @Column(name = "payment_method", length = 50)
    String paymentMethod;
    
    @Column(name = "transaction_id", length = 100)
    String transactionId;
    
    @Column(name = "paid_at")
    LocalDateTime paidAt;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    String notes;
}
