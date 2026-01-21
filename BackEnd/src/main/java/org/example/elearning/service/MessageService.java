package org.example.elearning.service;

import org.example.elearning.dto.request.SendMessageRequest;
import org.example.elearning.dto.response.MessageResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.springframework.data.domain.Pageable;


public interface MessageService {
    MessageResponse sendMessage(SendMessageRequest request, Long senderId);
    PaginatedResponse<MessageResponse> getMessages(Long conversationId, Long userId, Pageable pageable);
    void markMessagesAsRead(Long conversationId, Long userId);
    void deleteMessage(Long messageId, Long userId, boolean isAdmin);

}
