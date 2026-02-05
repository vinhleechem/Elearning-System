package org.example.elearning.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class LessonProgressResponse {
    Long progressId;
    Long enrollmentId;
    Long lessonId;
    boolean isCompleted;
    LocalDateTime completedAt;
    Integer timeSpentSeconds;
    Integer lastPositionSeconds;
}
