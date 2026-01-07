package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.VideoAssetRequest;
import org.example.elearning.dto.response.VideoAssetResponse;
import org.example.elearning.entity.VideoAssetEntity;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.VideoAssetRepository;
import org.example.elearning.service.VideoAssetService;
import org.example.elearning.util.CloudinaryUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VideoAssetServiceImpl implements VideoAssetService {

    VideoAssetRepository videoAssetRepository;
    CloudinaryUtil cloudinaryUtil;

    @Override
    @Transactional
    public VideoAssetResponse uploadVideo(MultipartFile file, String title) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            log.info("Uploading video to Cloudinary: {}", file.getOriginalFilename());
            
            // Upload to Cloudinary
            String videoUrl = cloudinaryUtil.uploadVideo(file);
            
            log.info("Video uploaded successfully. URL: {}", videoUrl);

            // Create video asset entity
            String originalFilename = file.getOriginalFilename();
            VideoAssetEntity entity = VideoAssetEntity.builder()
                    .title(title != null ? title : originalFilename)
                    .originalUrl(videoUrl)
                    .provider("cloudinary")
                    .status("ready")
                    .sizeBytes(file.getSize())
                    .build();

            return toResponse(videoAssetRepository.save(entity));
        } catch (IOException e) {
            log.error("Failed to upload video: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload video: " + e.getMessage(), e);
        }
    }

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

        if (request.getTitle() != null)
            entity.setTitle(request.getTitle());
        if (request.getOriginalUrl() != null)
            entity.setOriginalUrl(request.getOriginalUrl());
        if (request.getProvider() != null)
            entity.setProvider(request.getProvider());

        return toResponse(videoAssetRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        VideoAssetEntity entity = videoAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video asset not found"));
        
        // Delete from Cloudinary if provider is cloudinary
        if ("cloudinary".equals(entity.getProvider()) && entity.getOriginalUrl() != null) {
            try {
                cloudinaryUtil.deleteVideoByUrl(entity.getOriginalUrl());
                log.info("Deleted video from Cloudinary: {}", entity.getOriginalUrl());
            } catch (Exception e) {
                log.error("Failed to delete video from Cloudinary: {}", e.getMessage(), e);
            }
        }
        
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
