package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.example.elearning.dto.request.VideoAssetRequest;
import org.example.elearning.dto.response.VideoAssetResponse;
import org.example.elearning.entity.VideoAssetEntity;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.VideoAssetRepository;
import org.example.elearning.service.VideoAssetService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VideoAssetServiceImpl implements VideoAssetService {

    VideoAssetRepository videoAssetRepository;

    @NonFinal
    @Value("${file.upload.dir:uploads/videos}")
    String uploadDir;

    @Override
    @Transactional
    public VideoAssetResponse uploadVideo(MultipartFile file, String title) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save file
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Create video asset entity
            String videoUrl = "/uploads/videos/" + filename;
            VideoAssetEntity entity = VideoAssetEntity.builder()
                    .title(title != null ? title : originalFilename)
                    .originalUrl(videoUrl)
                    .provider("local")
                    .status("ready")
                    .sizeBytes(file.getSize())
                    .build();

            return toResponse(videoAssetRepository.save(entity));
        } catch (IOException e) {
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
