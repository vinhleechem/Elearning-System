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

    @Override
    public List<LessonResponse> getLessonsBySection(Long sectionId) {
        SectionEntity section = sectionService.getSectionEntityById(sectionId);
        return lessonRepository.findBySectionOrderBySortOrderAsc(section)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public LessonResponse getLessonById(Long lessonId) {
        LessonEntity entity = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
        return toResponse(entity);
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

        LessonEntity entity = LessonEntity.builder()
                .section(section)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .videoAssetId(request.getVideoAssetId())
                .videoUrl(request.getVideoUrl())
                .articleContent(request.getArticleContent())
                .durationSeconds(request.getDurationSeconds())
                .isPreview(request.getIsPreview() != null && request.getIsPreview())
                .isDownloadable(request.getIsDownloadable() != null && request.getIsDownloadable())
                .sortOrder(sortOrder)
                .isActive(request.getIsActive() != null && request.getIsActive())
                .build();

        return toResponse(lessonRepository.save(entity));
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonRequest request) {
        LessonEntity entity = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));

        if (request.getTitle() != null)
            entity.setTitle(request.getTitle());
        if (request.getDescription() != null)
            entity.setDescription(request.getDescription());
        if (request.getType() != null)
            entity.setType(request.getType());
        if (request.getVideoAssetId() != null)
            entity.setVideoAssetId(request.getVideoAssetId());
        if (request.getVideoUrl() != null)
            entity.setVideoUrl(request.getVideoUrl());
        if (request.getArticleContent() != null)
            entity.setArticleContent(request.getArticleContent());
        if (request.getDurationSeconds() != null)
            entity.setDurationSeconds(request.getDurationSeconds());
        if (request.getIsPreview() != null)
            entity.setIsPreview(request.getIsPreview());
        if (request.getIsDownloadable() != null)
            entity.setIsDownloadable(request.getIsDownloadable());
        if (request.getSortOrder() != null)
            entity.setSortOrder(request.getSortOrder());
        if (request.getIsActive() != null)
            entity.setIsActive(request.getIsActive());

        return toResponse(lessonRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId) {
        LessonEntity entity = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
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
                .durationSeconds(entity.getDurationSeconds())
                .isPreview(entity.getIsPreview())
                .isDownloadable(entity.getIsDownloadable())
                .sortOrder(entity.getSortOrder())
                .isActive(entity.getIsActive())
                .build();
    }
}
