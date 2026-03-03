package org.example.elearning.repository;

import java.util.List;
import java.util.Optional;

import org.example.elearning.entity.LessonProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgressEntity, Long> {

    @Query("SELECT COUNT(lp) FROM LessonProgressEntity lp " +
            "WHERE lp.enrollment.enrollmentId = :enrollmentId " +
            "AND lp.isCompleted = true")
    int countCompletedLessons(@Param("enrollmentId") Long enrollmentId);
    Optional<LessonProgressEntity> findByEnrollment_EnrollmentIdAndLesson_LessonId(Long enrollmentEnrollmentId, Long lessonLessonId);

    List<LessonProgressEntity> findByEnrollment_EnrollmentId(Long enrollmentEnrollmentId);
}
