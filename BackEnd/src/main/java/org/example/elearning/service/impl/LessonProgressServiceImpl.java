package org.example.elearning.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.example.elearning.dto.response.LessonProgressResponse;
import org.example.elearning.entity.EnrollmentEntity;
import org.example.elearning.entity.LessonEntity;
import org.example.elearning.entity.LessonProgressEntity;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.repository.LessonProgressRepository;
import org.example.elearning.repository.LessonRepository;
import org.example.elearning.service.LessonProgressService;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonProgressServiceImpl implements LessonProgressService {

    LessonProgressRepository lessonProgressRepository;
    EnrollmentRepository enrollmentRepository;
    LessonRepository lessonRepository;

    /**
     * Lấy progress của tất cả lessons
     * GET /api/v1/enrollments/1/progress
     */
    public List<LessonProgressResponse> getEnrollmentProgress(Long enrollmentId) {
        return lessonProgressRepository.findByEnrollment_EnrollmentId(enrollmentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    /**
     * Lấy progress của tất cả 1 lessons cụ thể
     * GET /api/v1/enrollments/1/lessons/1/progress
     */
    public LessonProgressResponse getLessonProgress(Long enrollmentId, Long lessonId) {
        LessonProgressEntity progress = lessonProgressRepository
                .findByEnrollment_EnrollmentIdAndLesson_LessonId(enrollmentId, lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson progress not found"));

        return mapToResponse(progress);
    }

    @Override
    public void markLessonCompleted(Long enrollmentId, Long lessonId, boolean isToggle) {
        LessonProgressEntity lessonProgress = lessonProgressRepository.findByEnrollment_EnrollmentIdAndLesson_LessonId(enrollmentId, lessonId)
                .orElseGet(() -> saveLessonProgress(enrollmentId, lessonId));

        boolean currentlyCompleted = Boolean.TRUE.equals(lessonProgress.getIsCompleted());

        if (isToggle) {
            boolean newCompleted = !currentlyCompleted;
            lessonProgress.setIsCompleted(newCompleted);
            lessonProgress.setCompletedAt(newCompleted ? LocalDateTime.now() : null);
        } else {
            if (!currentlyCompleted) {
                lessonProgress.setIsCompleted(true);
                lessonProgress.setCompletedAt(LocalDateTime.now());
            }
        }

        lessonProgressRepository.save(lessonProgress);
        updateEnrollmentProgress(enrollmentId);
    }

    @Override
    public void updateVideoPosition(Long enrollmentId, Long lessonId, Integer lastPositionSeconds) {
        LessonProgressEntity progress = lessonProgressRepository
                .findByEnrollment_EnrollmentIdAndLesson_LessonId(enrollmentId, lessonId)
                .orElseGet(() -> saveLessonProgress(enrollmentId, lessonId));

        progress.setLastPositionSeconds(lastPositionSeconds);
        progress.setLastAccessedAt(LocalDateTime.now());
        lessonProgressRepository.save(progress);
    }

    @Override
    public void updateEnrollmentProgress(Long enrollmentId) {
        EnrollmentEntity enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        Long courseId = enrollment.getCourse().getCourseId();
        int totalLessons = lessonRepository.countBySection_Course_CourseId(courseId);

        if(totalLessons == 0){
            enrollment.setProgress(0f);
        }else{
            int completedLessons = lessonProgressRepository.countCompletedLessons(enrollmentId);
            float progress = (completedLessons  * 100f/ totalLessons);
            enrollment.setProgress(progress);
        }

        enrollmentRepository.save(enrollment);

    }
    private LessonProgressEntity saveLessonProgress(Long enrollmentId, Long lessonId) {
        EnrollmentEntity enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        LessonEntity lesson = lessonRepository.findById(lessonId)
                .orElseThrow();

        LessonProgressEntity newProgress = LessonProgressEntity.builder()
                .enrollment(enrollment)
                .lesson(lesson)
                .isCompleted(false)
                .timeSpentSeconds(0)
                .lastPositionSeconds(0)
                .lastAccessedAt(LocalDateTime.now())
                .build();

        return  lessonProgressRepository.save(newProgress);

    }
    private LessonProgressResponse mapToResponse(LessonProgressEntity progress) {
        return LessonProgressResponse.builder()
                .lessonId(progress.getLesson().getLessonId())
                .enrollmentId(progress.getEnrollment().getEnrollmentId())
                .isCompleted(progress.getIsCompleted())
                .completedAt(progress.getCompletedAt())
                .timeSpentSeconds(progress.getTimeSpentSeconds())
                .lastPositionSeconds(progress.getLastPositionSeconds())
                .build();
    }
}
