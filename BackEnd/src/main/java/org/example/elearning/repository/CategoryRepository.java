package org.example.elearning.repository;

import org.example.elearning.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    Optional<CategoryEntity> findBySlugAndIsDeletedFalse(String slug);

    List<CategoryEntity> findByParentIsNullAndIsActiveTrueAndIsDeletedFalseOrderByNameAsc();

    List<CategoryEntity> findByParentIdAndIsActiveTrueAndIsDeletedFalseOrderByLevelAscNameAsc(Long parentId);

    List<CategoryEntity> findByIsActiveFalseAndIsDeletedFalse();

    /**
     * Load TẤT CẢ categories trong 1 SQL query duy nhất.
     * Service sẽ build tree trong Java — tránh hoàn toàn N+1.
     */
    @Query("SELECT c FROM CategoryEntity c WHERE c.isDeleted = false ORDER BY c.level ASC, c.name ASC")
    List<CategoryEntity> findAllForTree();
}
