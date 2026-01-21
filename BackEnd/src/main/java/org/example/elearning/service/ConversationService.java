package org.example.elearning.service;

import org.example.elearning.dto.request.ConversationRequest;
import org.example.elearning.dto.response.ConversationResponse;
import org.example.elearning.dto.response.MessageResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.ConversationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ConversationService {
    // ========== USER METHODS ==========
    ConversationEntity findById(Long conversationId);
    ConversationResponse createConversation(ConversationRequest conversationRequest, Long studentId);
    PaginatedResponse<ConversationResponse> getMyConversations(Long userId, boolean archived, Pageable pageable);
    void markAsRead(Long conversationId, Long userId);
    void setConversationArchived(Long conversationId, boolean isArchived);

    // ========== ADMIN METHODS ==========
    PaginatedResponse<ConversationResponse> getAllConversations(
            Long courseId,
            Long instructorId,
            Long studentId,
            Boolean isArchived,
            Boolean isLocked,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String keyword,
            Pageable pageable
    );
    ConversationResponse getConversationDetail(Long conversationId);
    void setConversationLocked(Long conversationId, boolean locked);
}
