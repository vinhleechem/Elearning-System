package org.example.elearning.repository;

import org.example.elearning.entity.PromotionEntity;
import org.example.elearning.enums.PromotionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<PromotionEntity, Long> {

    // Tìm promotion đang active
    @Query("SELECT p FROM PromotionEntity p " +
            "WHERE p.isActive = true " +
            "AND p.isDeleted = false " +
            "AND :now BETWEEN p.startDate AND p.endDate " +
            "ORDER BY p.priority DESC")
    List<PromotionEntity> findActivePromotions(@Param("now") LocalDateTime now);

    // Tìm promotion theo type
    List<PromotionEntity> findByPromotionTypeAndIsActiveTrue(PromotionType promotionType);

    // Tìm promotion theo ID và check active
    @Query("SELECT p FROM PromotionEntity p " +
            "WHERE p.promotionId = :id " +
            "AND p.isActive = true " +
            "AND p.isDeleted = false " +
            "AND :now BETWEEN p.startDate AND p.endDate")
    Optional<PromotionEntity> findActivePromotionById(
            @Param("id") Long id,
            @Param("now") LocalDateTime now);
}
