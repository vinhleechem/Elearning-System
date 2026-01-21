package org.example.elearning.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationResponse {
    Long conversationId;
    
    // Course info
    Long courseId;
    String courseName;

    // Student info
    Long studentId;
    String studentName;

    // Instructor info
    Long instructorId;
    Long instructorUserId; // Added for WebSocket targeting
    String instructorName;
    String instructorAvatar;
    
    // Last message preview
    String lastMessageContent;
    LocalDateTime lastMessageAt;
    
    // Unread counts
    Integer studentUnreadCount;
    Integer instructorUnreadCount;
    
    // Metadata
    Boolean isArchived;
    LocalDateTime createdAt;
}
