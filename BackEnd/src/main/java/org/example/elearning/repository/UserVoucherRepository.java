package org.example.elearning.repository;

import org.example.elearning.entity.UserVoucherEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucherEntity, Long> {

    // Tìm vouchers của user (chưa sử dụng)
    @Query("SELECT uv FROM UserVoucherEntity uv " +
            "JOIN FETCH uv.voucher v " +
            "WHERE uv.user.userId = :userId " +
            "AND uv.isUsed = false " +
            "AND uv.isDeleted = false " +
            "AND v.isActive = true " +
            "AND :now BETWEEN v.startDate AND v.endDate")
    List<UserVoucherEntity> findAvailableVouchersByUserId(
            @Param("userId") Long userId,
            @Param("now") java.time.LocalDateTime now);

    // Check user đã có voucher này chưa
    Optional<UserVoucherEntity> findByUser_UserIdAndVoucher_VoucherIdAndIsDeletedFalse(
            Long userId,
            Long voucherId);

    // Đếm số lần user đã dùng voucher này
    @Query("SELECT COUNT(uv) FROM UserVoucherEntity uv " +
            "WHERE uv.user.userId = :userId " +
            "AND uv.voucher.voucherId = :voucherId " +
            "AND uv.isUsed = true " +
            "AND uv.isDeleted = false")
    Long countUsedVouchersByUserAndVoucher(
            @Param("userId") Long userId,
            @Param("voucherId") Long voucherId);
}
