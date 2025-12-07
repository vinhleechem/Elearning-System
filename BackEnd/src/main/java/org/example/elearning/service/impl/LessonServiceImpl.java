package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.LessonRequest;
import org.example.elearning.dto.response.LessonResponse;
import org.example.elearning.entity.LessonEntity;
import org.example.elearning.entity.SectionEntity;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.LessonRepository;
import org.example.elearning.repository.SectionRepository;
import org.example.elearning.service.LessonService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonServiceImpl implements LessonService {

    LessonRepository lessonRepository;
    SectionRepository sectionRepository;

    @Override
    public List<LessonResponse> getLessonsBySection(Long sectionId) {
        SectionEntity section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        return lessonRepository.findBySectionOrderBySortOrderAsc(section)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public LessonResponse getLessonById(Long lessonId) {
        LessonEntity entity = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        return toResponse(entity);
    }

    @Override
    @Transactional
    public LessonResponse createLesson(Long sectionId, LessonRequest request) {
        SectionEntity section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        LessonEntity entity = LessonEntity.builder()
                .section(section)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .videoAssetId(request.getVideoAssetId())
                .videoUrl(request.getVideoUrl())
                .articleContent(request.getArticleContent())
                .durationMinutes(request.getDurationMinutes())
                .isPreview(request.getIsPreview())
                .isDownloadable(request.getIsDownloadable())
                .sortOrder(request.getSortOrder())
                .isActive(request.getIsActive())
                .build();

        return toResponse(lessonRepository.save(entity));
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonRequest request) {
        LessonEntity entity = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        if (request.getTitle() != null) entity.setTitle(request.getTitle());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getType() != null) entity.setType(request.getType());
        if (request.getVideoAssetId() != null) entity.setVideoAssetId(request.getVideoAssetId());
        if (request.getVideoUrl() != null) entity.setVideoUrl(request.getVideoUrl());
        if (request.getArticleContent() != null) entity.setArticleContent(request.getArticleContent());
        if (request.getDurationMinutes() != null) entity.setDurationMinutes(request.getDurationMinutes());
        if (request.getIsPreview() != null) entity.setIsPreview(request.getIsPreview());
        if (request.getIsDownloadable() != null) entity.setIsDownloadable(request.getIsDownloadable());
        if (request.getSortOrder() != null) entity.setSortOrder(request.getSortOrder());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());

        return toResponse(lessonRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId) {
        LessonEntity entity = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        lessonRepository.delete(entity);
    }

    private LessonResponse toResponse(LessonEntity entity) {
        return LessonResponse.builder()
                .lessonId(entity.getLessonId())
                .sectionId(entity.getSection().getSectionId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .type(entity.getType())
                .videoAssetId(entity.getVideoAssetId())
                .videoUrl(entity.getVideoUrl())
                .articleContent(entity.getArticleContent())
                .durationMinutes(entity.getDurationMinutes())
                .isPreview(entity.getIsPreview())
                .isDownloadable(entity.getIsDownloadable())
                .sortOrder(entity.getSortOrder())
                .isActive(entity.getIsActive())
                .build();
    }
}


