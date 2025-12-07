package org.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorResponse {
    private Long instructorId;
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String headline;
    private String biography;
    private String website;
    private String linkedin;
    private String twitter;
    private String youtube;
    private Integer totalStudents;
    private Integer totalCourses;
}

