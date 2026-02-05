package org.example.elearning.repository;

import org.example.elearning.entity.LessonProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgressEntity, Long> {
}
