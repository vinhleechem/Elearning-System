package org.example.elearning.service;

import org.example.elearning.dto.response.EnrollmentResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.UserEntity;

import java.util.List;

public interface EnrollmentService {
    List<EnrollmentResponse> getMyEnrollments();

    EnrollmentResponse getEnrollmentDetail(Long enrollmentId);

    void updateProgress(Long enrollmentId, Float progress);

    boolean isEnrolled(Long courseId);

    void createEnrollment(UserEntity user,
            CourseEntity course);
}
