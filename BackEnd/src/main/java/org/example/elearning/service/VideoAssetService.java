package org.example.elearning.service;

import org.example.elearning.dto.request.VideoAssetRequest;
import org.example.elearning.dto.response.VideoAssetResponse;
import org.springframework.web.multipart.MultipartFile;

public interface VideoAssetService {

    VideoAssetResponse uploadVideo(MultipartFile file, String title);

    VideoAssetResponse create(VideoAssetRequest request);

    VideoAssetResponse getById(Long id);

    VideoAssetResponse update(Long id, VideoAssetRequest request);

    void delete(Long id);
}
