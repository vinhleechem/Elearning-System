package org.example.elearning.repository;

import org.example.elearning.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    Optional<CategoryEntity> findBySlugAndIsDeletedFalse(String slug);

    List<CategoryEntity> findByParentIsNullAndIsActiveTrueAndIsDeletedFalseOrderByNameAsc();

    List<CategoryEntity> findByParentIdAndIsActiveTrueAndIsDeletedFalseOrderByLevelAscNameAsc(Long parentId);

    List<CategoryEntity> findByIsActiveFalseAndIsDeletedFalse();

    // Eager load children để tránh lazy loading
    // khi load CategoryEntity cấp cha, tự động load luôn relationship children
    @EntityGraph(attributePaths = {"children"})
    List<CategoryEntity> findByParentIsNullAndIsDeletedFalse();

    @EntityGraph(attributePaths = {"children"})
    Optional<CategoryEntity> findByIdAndParentIsNullAndIsDeletedFalse(Long id);
}


