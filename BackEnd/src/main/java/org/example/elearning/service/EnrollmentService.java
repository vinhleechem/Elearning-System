package org.example.elearning.service;

import org.example.elearning.dto.response.EnrollmentResponse;

import java.util.List;

public interface EnrollmentService {
    List<EnrollmentResponse> getMyEnrollments();
    EnrollmentResponse getEnrollmentDetail(Long enrollmentId);
    void updateProgress(Long enrollmentId, Float progress);
    boolean isEnrolled(Long courseId);
}

