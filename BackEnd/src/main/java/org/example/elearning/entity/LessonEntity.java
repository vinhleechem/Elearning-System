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
    ContentType type; // VIDEO, ARTICLE, QUIZ, ASSIGNMENT

    @Column(name = "video_asset_id")
    Long videoAssetId; // sẽ link tới bảng video_assets

    @Column(name = "video_url")
    String videoUrl;

    @Column(name = "article_content", columnDefinition = "TEXT")
    String articleContent;

    @Column(name = "duration_minutes")
    Integer durationMinutes;

    @Column(name = "is_preview")
    Boolean isPreview;

    @Column(name = "is_downloadable")
    Boolean isDownloadable;

    @Column(name = "sort_order")
    Integer sortOrder;

    @Column(name = "is_active")
    Boolean isActive;
}
