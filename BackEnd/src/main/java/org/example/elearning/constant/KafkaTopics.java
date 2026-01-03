package org.example.elearning.constant;

/**
 * Kafka topic constants for E-learning system
 */
public final class KafkaTopics {
    
    /**
     * Topic for course-related events
     * Events: COURSE_CREATED, COURSE_UPDATED, COURSE_DELETED, 
     *         COURSE_PUBLISHED, COURSE_UNPUBLISHED
     */
    public static final String COURSE_EVENTS = "course-events";
    
    // Future topics (for reference)
    // public static final String USER_EVENTS = "user-events";
    // public static final String ENROLLMENT_EVENTS = "enrollment-events";
    // public static final String NOTIFICATION_EVENTS = "notification-events";
    
    private KafkaTopics() {
        throw new AssertionError("Cannot instantiate constants class");
    }
}
