package org.example.elearning.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoAssetResponse {
    Long assetId;
    String title;
    String status;
    String hlsUrl;
    String dashUrl;
    String originalUrl;
    String thumbnailUrl;
    Integer duration;
    Long sizeBytes;
    String resolution;
    String provider;
}


