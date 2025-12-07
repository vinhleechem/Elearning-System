package org.example.elearning.repository;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    Optional<CourseEntity> findBySlug(String slug);

    Page<CourseEntity> findByStatusAndIsDeletedFalse(CourseStatus status, Pageable pageable);

    Page<CourseEntity> findByTitleContainingIgnoreCaseAndIsDeletedFalse(String title, Pageable pageable);
}


