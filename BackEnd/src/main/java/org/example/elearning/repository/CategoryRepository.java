package org.example.elearning.repository;

import org.example.elearning.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    Optional<CategoryEntity> findBySlug(String slug);

    List<CategoryEntity> findByParentIsNullAndIsActiveTrueOrderByLevelAscNameAsc();

    List<CategoryEntity> findByParentIdAndIsActiveTrueOrderByLevelAscNameAsc(Long parentId);
}


