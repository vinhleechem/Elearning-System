package org.example.elearning.service;

import org.example.elearning.dto.request.VideoAssetRequest;
import org.example.elearning.dto.response.VideoAssetResponse;

public interface VideoAssetService {

    VideoAssetResponse create(VideoAssetRequest request);

    VideoAssetResponse getById(Long id);

    VideoAssetResponse update(Long id, VideoAssetRequest request);

    void delete(Long id);
}


