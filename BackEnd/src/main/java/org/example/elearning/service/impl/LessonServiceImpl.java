package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.LessonRequest;
import org.example.elearning.dto.response.LessonResponse;
import org.example.elearning.entity.LessonEntity;
import org.example.elearning.entity.SectionEntity;
import org.example.elearning.entity.VideoAssetEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.LessonMapper;
import org.example.elearning.repository.LessonRepository;
import org.example.elearning.repository.VideoAssetRepository;
import org.example.elearning.service.LessonService;
import org.example.elearning.service.SectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonServiceImpl implements LessonService {

    LessonRepository lessonRepository;
    SectionService sectionService;
    LessonMapper lessonMapper;
    VideoAssetRepository videoAssetRepository;

    private LessonResponse enrichWithVideoAsset(LessonEntity entity) {
        LessonResponse response = lessonMapper.toResponse(entity);

        if ((response.getVideoUrl() == null || response.getVideoUrl().isEmpty())
                && entity.getVideoAssetId() != null) {
            Optional<VideoAssetEntity> assetOpt = videoAssetRepository.findById(entity.getVideoAssetId());
            if (assetOpt.isPresent()) {
                VideoAssetEntity asset = assetOpt.get();
                response.setVideoUrl(asset.getOriginalUrl());
                if (response.getDurationSeconds() == null && asset.getDuration() != null) {
                    response.setDurationSeconds(asset.getDuration());
                }
            }
        }

        return response;
    }

    @Override
    public LessonEntity getLesson(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LESSON_NOT_FOUND.getMessage()));
    }

    @Override
    public List<LessonResponse> getLessonsBySection(Long sectionId) {
        SectionEntity section = sectionService.getSectionEntityById(sectionId);
        List<LessonEntity> lessons = lessonRepository.findBySectionOrderBySortOrderAsc(section);
        return lessons.stream()
                .map(this::enrichWithVideoAsset)
                .toList();
    }

    @Override
    public LessonResponse getLessonById(Long lessonId) {
        LessonEntity entity = getLesson(lessonId);
        return enrichWithVideoAsset(entity);
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

        if (request.getVideoAssetId() != null) {
            VideoAssetEntity asset = videoAssetRepository.findById(request.getVideoAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Video asset not found"));
            entity.setVideoAssetId(asset.getAssetId());
            entity.setVideoUrl(asset.getOriginalUrl());
            if (request.getDurationSeconds() == null && asset.getDuration() != null) {
                entity.setDurationSeconds(asset.getDuration());
            }
        }

        return enrichWithVideoAsset(lessonRepository.save(entity));
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonRequest request) {
        LessonEntity entity = getLesson(lessonId);
        lessonMapper.updateEntity(entity, request);

        if (request.getVideoAssetId() != null) {
            VideoAssetEntity asset = videoAssetRepository.findById(request.getVideoAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Video asset not found"));
            entity.setVideoAssetId(asset.getAssetId());
            entity.setVideoUrl(asset.getOriginalUrl());
            if (request.getDurationSeconds() == null && asset.getDuration() != null) {
                entity.setDurationSeconds(asset.getDuration());
            }
        }

        return enrichWithVideoAsset(lessonRepository.save(entity));
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
