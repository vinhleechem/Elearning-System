package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.VoucherApplicability;
import org.example.elearning.enums.VoucherType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "vouchers")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voucher_id")
    Long voucherId;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    String code;

    @Column(name = "name", length = 255)
    String name; // Tên voucher để hiển thị (VD: "Voucher Sinh nhật")

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_type", nullable = false)
    @Builder.Default
    VoucherType voucherType = VoucherType.PUBLIC;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    InstructorEntity instructor; // Instructor tạo voucher (null = system voucher)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    PromotionEntity promotion; // Liên kết với promotion nếu có

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    @Builder.Default
    DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(name = "discount_value", precision = 10, scale = 2, nullable = false)
    BigDecimal discountValue;

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    BigDecimal maxDiscountAmount; // Giới hạn giảm tối đa

    @Column(name = "min_order_value", precision = 10, scale = 2)
    BigDecimal minOrderValue; // Giá trị đơn hàng tối thiểu

    // Giới hạn sử dụng
    @Column(name = "total_usage_limit")
    Integer totalUsageLimit; // Tổng số lượt sử dụng cho tất cả user

    @Column(name = "per_user_limit")
    @Builder.Default
    Integer perUserLimit = 1; // Số lượt 1 user được sử dụng

    @Column(name = "used_count")
    @Builder.Default
    Integer usedCount = 0;

    @Column(name = "start_date", nullable = false)
    LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    LocalDateTime endDate;

    @Column(name = "is_active")
    @Builder.Default
    Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "applicable_to", nullable = false)
    @Builder.Default
    VoucherApplicability applicableTo = VoucherApplicability.ALL;

    // Relationship với Course (Many-to-Many) - Chỉ khi applicableTo =
    // SPECIFIC_COURSES
    @ManyToMany
    @JoinTable(name = "voucher_courses", joinColumns = @JoinColumn(name = "voucher_id"), inverseJoinColumns = @JoinColumn(name = "course_id"))
    @Builder.Default
    List<CourseEntity> applicableCourses = new ArrayList<>();

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<UserVoucherEntity> userVouchers = new ArrayList<>();
}
