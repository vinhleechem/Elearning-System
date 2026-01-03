package org.example.elearning.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event DTO for course-related Kafka messages
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEvent {
    
    /**
     * Event type: COURSE_CREATED, COURSE_UPDATED, COURSE_DELETED, 
     * COURSE_PUBLISHED, COURSE_UNPUBLISHED
     */
    private String eventType;
    
    /**
     * Course ID
     */
    private Long courseId;
    
    /**
     * Event timestamp
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    /**
     * Additional metadata (optional)
     */
    private String metadata;
}
