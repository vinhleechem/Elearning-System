package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "video_assets")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoAssetEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    Long assetId;

    @Column(name = "title", length = 255)
    String title;

    @Column(name = "status", length = 50)
    String status; // uploading, processing, ready, failed

    @Column(name = "hls_url", length = 500)
    String hlsUrl;

    @Column(name = "dash_url", length = 500)
    String dashUrl;

    @Column(name = "original_url", length = 500)
    String originalUrl;

    @Column(name = "thumbnail_url", length = 500)
    String thumbnailUrl;

    @Column(name = "duration")
    Integer duration; 

    @Column(name = "size_bytes")
    Long sizeBytes;

    @Column(name = "resolution", length = 20)
    String resolution;

    @Column(name = "provider", length = 50)
    String provider;
}


