package org.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private String courseImage;
    private String instructorName;
    private Float progress;
    private LocalDateTime enrolledAt;
    private Integer totalLessons;
    private Integer completedLessons;
}
