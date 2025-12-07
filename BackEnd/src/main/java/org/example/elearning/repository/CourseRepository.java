package org.example.elearning.repository;

import java.util.Optional;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    Page<CourseEntity> findAll(org.springframework.data.jpa.domain.Specification<CourseEntity> spec, Pageable pageable);

}


