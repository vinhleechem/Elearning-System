package org.example.elearning.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.SenderType;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageResponse {
    
    Long messageId;
    Long conversationId;
    
    // Sender info
    Long senderId;
    String senderName;
    String senderAvatar;
    SenderType senderType;
    
    // Content
    String content;
    
    // Read status
    Boolean isRead;
    LocalDateTime readAt;
    
    // Metadata
    LocalDateTime createdAt;
}
