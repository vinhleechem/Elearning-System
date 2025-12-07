package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.VideoAssetRequest;
import org.example.elearning.dto.response.VideoAssetResponse;
import org.example.elearning.entity.VideoAssetEntity;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.VideoAssetRepository;
import org.example.elearning.service.VideoAssetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VideoAssetServiceImpl implements VideoAssetService {

    VideoAssetRepository videoAssetRepository;

    @Override
    @Transactional
    public VideoAssetResponse create(VideoAssetRequest request) {
        VideoAssetEntity entity = VideoAssetEntity.builder()
                .title(request.getTitle())
                .originalUrl(request.getOriginalUrl())
                .provider(request.getProvider())
                .status("uploading")
                .build();
        return toResponse(videoAssetRepository.save(entity));
    }

    @Override
    public VideoAssetResponse getById(Long id) {
        VideoAssetEntity entity = videoAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video asset not found"));
        return toResponse(entity);
    }

    @Override
    @Transactional
    public VideoAssetResponse update(Long id, VideoAssetRequest request) {
        VideoAssetEntity entity = videoAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video asset not found"));

        if (request.getTitle() != null) entity.setTitle(request.getTitle());
        if (request.getOriginalUrl() != null) entity.setOriginalUrl(request.getOriginalUrl());
        if (request.getProvider() != null) entity.setProvider(request.getProvider());

        return toResponse(videoAssetRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        VideoAssetEntity entity = videoAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video asset not found"));
        videoAssetRepository.delete(entity);
    }

    private VideoAssetResponse toResponse(VideoAssetEntity entity) {
        return VideoAssetResponse.builder()
                .assetId(entity.getAssetId())
                .title(entity.getTitle())
                .status(entity.getStatus())
                .hlsUrl(entity.getHlsUrl())
                .dashUrl(entity.getDashUrl())
                .originalUrl(entity.getOriginalUrl())
                .thumbnailUrl(entity.getThumbnailUrl())
                .duration(entity.getDuration())
                .sizeBytes(entity.getSizeBytes())
                .resolution(entity.getResolution())
                .provider(entity.getProvider())
                .build();
    }
}


