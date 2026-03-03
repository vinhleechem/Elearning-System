package org.example.elearning.repository;

import org.example.elearning.entity.LessonEntity;
import org.example.elearning.entity.SectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<LessonEntity, Long> {
    List<LessonEntity> findBySectionOrderBySortOrderAsc(SectionEntity section);
    int countBySection_Course_CourseId(Long sectionCourseCourseId);
}


