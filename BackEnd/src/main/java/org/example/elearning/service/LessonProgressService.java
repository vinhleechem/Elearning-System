package org.example.elearning.service;

public interface LessonProgressService {
    void markLessonCompleted(Long enrollmentId, Long lessonId);
    void updateVideoPosition(Long enrollmentId, Long lessonId, Integer lastPositionSeconds);
    void updateEnrollmentProgress(Long enrollmentId);
}
