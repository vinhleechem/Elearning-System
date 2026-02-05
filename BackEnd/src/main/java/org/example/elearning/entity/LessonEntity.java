package org.example.elearning.entity;

import org.example.elearning.enums.ContentType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "lessons")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_id")
    Long lessonId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    SectionEntity section;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "description")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    ContentType type;

    @Column(name = "video_asset_id")
    Long videoAssetId;

    @Column(name = "video_url")
    String videoUrl;

    @Column(name = "article_content", columnDefinition = "TEXT")
    String articleContent;

    @Column(name = "duration_seconds")
    Integer durationSeconds;

    @Column(name = "is_preview")
    @Builder.Default
    Boolean isPreview = false;

    @Column(name = "is_downloadable")
    @Builder.Default
    Boolean isDownloadable = false;

    @Column(name = "is_active")
    @Builder.Default
    Boolean isActive = true;

    @Column(name = "sort_order")
    Integer sortOrder;

}
