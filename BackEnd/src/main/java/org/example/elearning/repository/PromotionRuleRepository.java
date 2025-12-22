package org.example.elearning.repository;

import org.example.elearning.entity.PromotionRuleEntity;
import org.example.elearning.enums.PromotionRuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionRuleRepository extends JpaRepository<PromotionRuleEntity, Long> {

    // Tìm rules theo promotion
    List<PromotionRuleEntity> findByPromotion_PromotionIdAndIsDeletedFalse(Long promotionId);

    // Tìm rules áp dụng cho course cụ thể
    @Query("SELECT pr FROM PromotionRuleEntity pr " +
            "WHERE pr.isDeleted = false " +
            "AND (pr.ruleType = :ruleType AND pr.targetId = :targetId " +
            "OR pr.ruleType = 'ALL')")
    List<PromotionRuleEntity> findApplicableRulesForTarget(
            @Param("ruleType") PromotionRuleType ruleType,
            @Param("targetId") Long targetId);
}
