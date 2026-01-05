package org.example.elearning.repository;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.ReviewEntity;
import org.example.elearning.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long>, JpaSpecificationExecutor<ReviewEntity> {

    List<ReviewEntity> findByCourseAndIsDeletedFalseOrderByCreatedAtDesc(CourseEntity course);

    Optional<ReviewEntity> findByCourseAndUserAndIsDeletedFalse(CourseEntity course, UserEntity user);

    Page<ReviewEntity> findByCourse(CourseEntity course, Pageable pageable);

    Optional<ReviewEntity> findByUserAndCourse(UserEntity user, CourseEntity course);

    boolean existsByUserAndCourse(UserEntity user, CourseEntity course);

    @Query("SELECT AVG(r.rating) FROM ReviewEntity r WHERE r.course = :course")
    Double getAverageRatingByCourse(@Param("course") CourseEntity course);

    Page<ReviewEntity> findByUserFullNameContainingIgnoreCaseOrCourseTitleContainingIgnoreCase(
            String userName, String courseTitle, Pageable pageable);
}


