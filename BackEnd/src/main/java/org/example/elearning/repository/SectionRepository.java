package org.example.elearning.repository;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.SectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<SectionEntity, Long> {
    List<SectionEntity> findByCourseOrderByPositionAsc(CourseEntity course);
}


