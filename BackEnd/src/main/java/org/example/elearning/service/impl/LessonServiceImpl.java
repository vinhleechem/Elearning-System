package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.LessonRequest;
import org.example.elearning.dto.response.LessonResponse;
import org.example.elearning.entity.LessonEntity;
import org.example.elearning.entity.SectionEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.LessonMapper;
import org.example.elearning.repository.LessonRepository;
import org.example.elearning.service.LessonService;
import org.example.elearning.service.SectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonServiceImpl implements LessonService {

    LessonRepository lessonRepository;
    SectionService sectionService;
    LessonMapper lessonMapper;

    @Override
    public LessonEntity getLesson(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LESSON_NOT_FOUND.getMessage()));
    }

    @Override
    public List<LessonResponse> getLessonsBySection(Long sectionId) {
        SectionEntity section = sectionService.getSectionEntityById(sectionId);
        return lessonMapper.toResponseList(lessonRepository.findBySectionOrderBySortOrderAsc(section));
    }

    @Override
    public LessonResponse getLessonById(Long lessonId) {
        LessonEntity entity = getLesson(lessonId);
        return lessonMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public LessonResponse createLesson(Long sectionId, LessonRequest request) {
        SectionEntity section = sectionService.getSectionEntityById(sectionId);

        Integer sortOrder = request.getSortOrder();
        if (sortOrder == null) {
            int currentSize = lessonRepository.findBySectionOrderBySortOrderAsc(section).size();
            sortOrder = currentSize + 1;
        }

        LessonEntity entity = lessonMapper.toEntity(request);
        entity.setSection(section);
        entity.setSortOrder(sortOrder);
        
        return lessonMapper.toResponse(lessonRepository.save(entity));
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonRequest request) {
        LessonEntity entity = getLesson(lessonId);
        lessonMapper.updateEntity(entity, request);
        return lessonMapper.toResponse(lessonRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId) {
        LessonEntity entity = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
        entity.setDeleted(true);
        lessonRepository.save(entity);
    }
}
