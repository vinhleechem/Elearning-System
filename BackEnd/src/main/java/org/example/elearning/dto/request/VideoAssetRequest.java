package org.example.elearning.dto.request;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoAssetRequest {
    String title;
    String originalUrl;
    String provider; // youtube, aws_s3, cloudflare_stream, bunny_stream
}


