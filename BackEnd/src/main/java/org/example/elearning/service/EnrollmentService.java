package org.example.elearning.service;

import org.example.elearning.dto.response.EnrollmentResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.EnrollmentEntity;
import org.example.elearning.entity.UserEntity;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EnrollmentService {
    List<EnrollmentResponse> getMyEnrollments();

    EnrollmentResponse getEnrollmentDetail(Long enrollmentId);

    void updateProgress(Long enrollmentId, Float progress);

    boolean isEnrolled(Long courseId);

    void createEnrollment(UserEntity user, CourseEntity course);

    boolean existsByUserAndCourse(UserEntity user, CourseEntity course);

    // Admin
    PaginatedResponse<EnrollmentResponse> getEnrollmentsForAdmin(Pageable pageable, Long courseId, String search);
}
