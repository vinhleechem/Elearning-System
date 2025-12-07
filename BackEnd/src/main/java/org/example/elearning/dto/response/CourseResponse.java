package org.example.elearning.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.CourseStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseResponse {
    Long courseId;
    Long instructorId;
    Long categoryId;

    String title;
    String slug;
    String shortDescription;
    String description;
    String whatYouLearn;
    String requirements;
    String targetAudience;

    String thumbnailUrl;
    String previewVideoUrl;

    String level;
    CourseStatus status;

    BigDecimal price;
    BigDecimal discountPrice;

    String language;
    Boolean hasCertificate;

    Integer totalDurationMinutes;
    Integer totalLectures;
    BigDecimal averageRating;
    Integer totalStudents;
    Integer totalReviews;
    LocalDateTime publishedAt;

    List<String> tags;
}


