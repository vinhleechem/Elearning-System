package org.example.elearning.repository;

import org.example.elearning.entity.VoucherEntity;
import org.example.elearning.enums.VoucherType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<VoucherEntity, Long> {

    // Tìm voucher theo code
    Optional<VoucherEntity> findByCodeAndIsDeletedFalse(String code);

    // Tìm voucher active theo code
    @Query("SELECT v FROM VoucherEntity v " +
            "WHERE v.code = :code " +
            "AND v.isActive = true " +
            "AND v.isDeleted = false " +
            "AND :now BETWEEN v.startDate AND v.endDate " +
            "AND v.usedCount < v.totalUsageLimit")
    Optional<VoucherEntity> findActiveVoucherByCode(
            @Param("code") String code,
            @Param("now") LocalDateTime now);

    // Tìm voucher theo type
    List<VoucherEntity> findByVoucherTypeAndIsActiveTrueAndIsDeletedFalse(VoucherType voucherType);

    // Tìm all active public vouchers
    @Query("SELECT v FROM VoucherEntity v " +
            "WHERE v.voucherType = 'PUBLIC' " +
            "AND v.isActive = true " +
            "AND v.isDeleted = false " +
            "AND :now BETWEEN v.startDate AND v.endDate " +
            "AND v.usedCount < v.totalUsageLimit")
    List<VoucherEntity> findAvailablePublicVouchers(@Param("now") LocalDateTime now);
}
