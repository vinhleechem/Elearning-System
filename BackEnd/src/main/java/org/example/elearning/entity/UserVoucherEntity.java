package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.VoucherSource;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user_vouchers")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserVoucherEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_voucher_id")
    Long userVoucherId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    VoucherEntity voucher;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    @Builder.Default
    VoucherSource source = VoucherSource.SYSTEM_GIFT;

    @Column(name = "received_at")
    @Builder.Default
    LocalDateTime receivedAt = LocalDateTime.now();

    @Column(name = "is_used")
    @Builder.Default
    Boolean isUsed = false;

    @Column(name = "used_at")
    LocalDateTime usedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    OrderEntity order; // Đơn hàng đã sử dụng voucher này
}
