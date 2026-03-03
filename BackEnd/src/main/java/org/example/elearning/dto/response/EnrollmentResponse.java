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
    private String slug;

    // Thông tin học viên (phục vụ admin quản lý tiến độ)
    private Long studentId;
    private String studentName;
    private String studentEmail;
}
