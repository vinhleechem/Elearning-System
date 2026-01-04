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
public class CourseRequest {

    @NotNull(message = "Instructor id không được để trống")
    Long instructorId;

    @NotNull(message = "Category id không được để trống")
    Long categoryId;

    @NotBlank(message = "Tiêu đề không được để trống")
    String title;

    @NotBlank(message = "Slug không được để trống")
    String slug;

    String shortDescription;
    String description;
    String whatYouLearn;
    String requirements;
    String targetAudience;

    BigDecimal price;
    String language;
    String level;
    Boolean hasCertificate;
}


