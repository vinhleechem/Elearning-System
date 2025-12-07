package org.example.elearning.service;

import org.example.elearning.dto.request.LessonRequest;
import org.example.elearning.dto.response.LessonResponse;

import java.util.List;

public interface LessonService {

    List<LessonResponse> getLessonsBySection(Long sectionId);

    LessonResponse getLessonById(Long lessonId);

    LessonResponse createLesson(Long sectionId, LessonRequest request);

    LessonResponse updateLesson(Long lessonId, LessonRequest request);

    void deleteLesson(Long lessonId);
}


