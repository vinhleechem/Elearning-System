package org.example.elearning.service;

import org.example.elearning.dto.request.LessonRequest;
import org.example.elearning.dto.response.LessonResponse;
import org.example.elearning.entity.LessonEntity;

import java.util.List;

public interface LessonService {

    LessonEntity getLesson(Long lessonId);

    List<LessonResponse> getLessonsBySection(Long sectionId);

    LessonResponse getLessonById(Long lessonId);

    LessonResponse createLesson(Long sectionId, LessonRequest request);

    LessonResponse updateLesson(Long lessonId, LessonRequest request);

    void deleteLesson(Long lessonId);
}


