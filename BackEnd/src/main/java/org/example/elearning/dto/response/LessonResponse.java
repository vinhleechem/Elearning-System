package org.example.elearning.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.ContentType;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonResponse {
    Long lessonId;
    Long sectionId;
    String title;
    String description;
    ContentType type;
    Long videoAssetId;
    String videoUrl;
    String articleContent;
    Integer durationMinutes;
    Boolean isPreview;
    Boolean isDownloadable;
    Integer sortOrder;
    Boolean isActive;
}


