package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseUpdateRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    String title;

    @NotNull(message = "Category id không được để trống")
    Long categoryId;

    String shortDescription;
    String description;
    String whatYouLearn;
    String requirements;
    String targetAudience;
    String thumbnailUrl;
    String previewVideoUrl;

    BigDecimal price;
    String language;
    String level;
    Boolean hasCertificate;
}
