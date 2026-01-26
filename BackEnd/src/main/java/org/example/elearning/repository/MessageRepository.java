package org.example.elearning.repository;

import org.example.elearning.entity.ConversationEntity;
import org.example.elearning.entity.MessageEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, Long> {

    // Get messages in DESC order (newest first) for pagination
    // Frontend will reverse to display oldest first
    Page<MessageEntity> findByConversationOrderByCreatedAtDesc(ConversationEntity conversation, Pageable pageable);
    
    @Modifying
    @Query("""
        UPDATE MessageEntity m 
        SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP 
        WHERE m.conversation.conversationId = :conversationId 
          AND m.sender.userId != :userId 
          AND m.isRead = false
        """)
    int markMessagesAsRead(@Param("conversationId") Long conversationId, 
                           @Param("userId") Long userId);

    Optional<MessageEntity> findTopByConversationOrderByCreatedAtDesc(ConversationEntity conversation);

}
