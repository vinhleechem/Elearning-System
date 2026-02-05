package org.example.elearning.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, Long>, JpaSpecificationExecutor<CourseEntity> {

    @EntityGraph(attributePaths = {"instructor", "instructor.user"})
    Optional<CourseEntity> findBySlug(String slug);

    @EntityGraph(attributePaths = {"instructor", "instructor.user"})
    Optional<CourseEntity> findById(Long id);

    @EntityGraph(attributePaths = {"instructor", "instructor.user"})
    Page<CourseEntity> findAll(Specification<CourseEntity> spec, Pageable pageable);

    boolean existsBySlug(String slug);
    
    @Query("SELECT COUNT(c) FROM CourseEntity c WHERE c.createdAt >= :startDate AND c.createdAt < :endDate")
    Long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<CourseEntity> findAllByIsDeletedFalse();

    List<CourseEntity> findAllByCourseIdInAndStatusAndIsDeletedIsFalse(Collection<Long> courseIds, CourseStatus status);
}


