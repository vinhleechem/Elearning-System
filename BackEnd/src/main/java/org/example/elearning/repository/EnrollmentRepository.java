package org.example.elearning.repository;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.EnrollmentEntity;
import org.example.elearning.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, Long> {

    Optional<EnrollmentEntity> findByUserAndCourseAndIsDeletedFalse(UserEntity user, CourseEntity course);

    boolean existsByUserAndCourse(UserEntity user, CourseEntity course);

    List<EnrollmentEntity> findByUser(UserEntity user);
}


