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
public class ReviewResponse {
    private Long reviewId;
    private Long courseId;
    private String courseTitle;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}

