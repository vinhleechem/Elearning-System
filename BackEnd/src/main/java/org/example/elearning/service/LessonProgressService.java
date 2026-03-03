package org.example.elearning.service;

import org.example.elearning.dto.response.LessonProgressResponse;

import java.util.List;

public interface LessonProgressService {
    LessonProgressResponse getLessonProgress(Long enrollmentId, Long lessonId);
    List<LessonProgressResponse> getEnrollmentProgress(Long enrollmentId);
    void markLessonCompleted(Long enrollmentId, Long lessonId, boolean isToggle);
    void updateVideoPosition(Long enrollmentId, Long lessonId, Integer lastPositionSeconds);
    void updateEnrollmentProgress(Long enrollmentId);
}
