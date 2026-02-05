package org.example.elearning.dto.filter;

import lombok.Data;
import org.example.elearning.enums.CourseLevel;
import org.example.elearning.enums.CourseStatus;


@Data
public class CourseFilterRequest {
    private String search;
    private Long categoryId;
    private CourseLevel level;
    private Double minPrice;
    private Double maxPrice;
    private Double minRating;
    private CourseStatus status;
}
