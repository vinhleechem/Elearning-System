package org.example.elearning.service;

import org.example.elearning.dto.response.EnrollmentResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.EnrollmentEntity;
import org.example.elearning.entity.UserEntity;

import java.util.List;
import java.util.Optional;

public interface EnrollmentService {
    List<EnrollmentResponse> getMyEnrollments();

    EnrollmentResponse getEnrollmentDetail(Long enrollmentId);

    void updateProgress(Long enrollmentId, Float progress);

    boolean isEnrolled(Long courseId);

    void createEnrollment(UserEntity user, CourseEntity course);
    
    // For internal service usage - returns entity instead of DTO
    Optional<EnrollmentEntity> findEnrollmentByUserAndCourse(UserEntity user, CourseEntity course);
    
    boolean existsByUserAndCourse(UserEntity user, CourseEntity course);
}
