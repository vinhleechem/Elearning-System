package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.ContentType;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonRequest {

    @NotBlank(message = "Tiêu đề bài học không được để trống")
    String title;

    String description;

    @NotNull(message = "Loại nội dung không được để trống")
    ContentType type; // VIDEO, ARTICLE, QUIZ, ASSIGNMENT

    Long videoAssetId;

    String videoUrl;

    String articleContent;

    Integer durationSeconds;

    Boolean isPreview;

    Boolean isDownloadable;

    Integer sortOrder;

    Boolean isActive;
}
