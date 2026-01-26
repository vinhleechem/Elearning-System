package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.SendMessageRequest;
import org.example.elearning.dto.response.MessageResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.ConversationEntity;
import org.example.elearning.entity.MessageEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.SenderType;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BadRequestException;
import org.example.elearning.exception.exceptions.ForbiddenException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.MessageMapper;
import org.example.elearning.repository.ConversationRepository;
import org.example.elearning.repository.MessageRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.MessageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageServiceImpl implements MessageService {

    MessageRepository messageRepository;
    ConversationRepository conversationRepository;
    UserRepository userRepository;
    MessageMapper messageMapper;
    org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, Long senderId) {
        ConversationEntity conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.CONVERSATION_NOT_FOUND.getMessage()
                ));

        if (Boolean.TRUE.equals(conversation.getIsLocked())) {
            throw new BadRequestException("Conversation đã bị khóa. Không thể gửi tin nhắn.");
        }

        UserEntity sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.USER_NOT_FOUND.getMessage()
                ));

        SenderType senderType = conversation.getStudent().getUserId().equals(senderId) ? SenderType.STUDENT : SenderType.INSTRUCTOR;


        MessageEntity message = MessageEntity.builder()
                .conversation(conversation)
                .sender(sender)
                .senderType(senderType)
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        conversation.setLastMessageId(message.getMessageId());
        conversation.setLastMessageAt(message.getCreatedAt());

        UserEntity recipient;
        if (senderType == SenderType.STUDENT) {
            conversation.setInstructorUnreadCount(conversation.getInstructorUnreadCount() + 1);
            recipient = conversation.getInstructor().getUser();
        } else {
            conversation.setStudentUnreadCount(conversation.getStudentUnreadCount() + 1);
            recipient = conversation.getStudent();
        }

        conversationRepository.save(conversation);
        MessageResponse response = messageMapper.toResponse(message);

        // Real-time: Send to conversation topic
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getConversationId(), response);

        // Real-time: Notify recipient (use userId as destination)
        NotificationPayload notification = new NotificationPayload(
            "Tin nhắn mới",
            "Bạn có tin nhắn mới từ " + sender.getFullName(),
            "INFO",
            conversation.getConversationId()
        );
        messagingTemplate.convertAndSendToUser(
            String.valueOf(recipient.getUserId()), 
            "/queue/notifications", 
            notification
        );

        return response;
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class NotificationPayload {
        String title;
        String message;
        String type;
        Long conversationId;
    }


    @Override
    public PaginatedResponse<MessageResponse> getMessages(
            Long conversationId,
            Long userId,
            Pageable pageable
    ) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.CONVERSATION_NOT_FOUND.getMessage()
                ));

        // Get messages in DESC order (newest first)
        // Page 0 = 50 newest messages
        // Page 1 = next 50 older messages, etc.
        Page<MessageEntity> messagesPage = messageRepository.findByConversationOrderByCreatedAtDesc(
                conversation,
                pageable
        );

        List<MessageResponse> messageResponses = messagesPage.getContent().stream()
                .map(messageMapper::toResponse)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                messageResponses,
                new PaginatedResponse.Pagination(
                        messagesPage.getNumber() + 1,
                        messagesPage.getSize(),
                        messagesPage.getTotalElements(),
                        messagesPage.getTotalPages()
                )
        );
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long conversationId, Long userId) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.CONVERSATION_NOT_FOUND.getMessage()
                ));
        int updatedCount = messageRepository.markMessagesAsRead(conversationId, userId);

        if(updatedCount > 0) {
            // Cập nhật lại số lượng tin nhắn chưa đọc trong conversation
            boolean isStudent = conversation.getStudent().getUserId().equals(userId);
            if (isStudent) {
                conversation.setStudentUnreadCount(0);
            } else {
                conversation.setInstructorUnreadCount(0);
            }
            conversationRepository.save(conversation);
        }

    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId, boolean isAdmin) {
        MessageEntity message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.MESSAGE_NOT_FOUND.getMessage()
                ));

        if (!isAdmin) {
            if (!message.getSender().getUserId().equals(userId)) {
                throw new ForbiddenException(ErrorCode.MESSAGE_DELETE_FORBIDDEN.getMessage());
            }
        }

        ConversationEntity conversation = message.getConversation();
        Long deletedMessageId = message.getMessageId();

        messageRepository.delete(message);

        if (conversation.getLastMessageId() != null &&
                conversation.getLastMessageId().equals(deletedMessageId)) {

            // Tìm message trước đó
            messageRepository.findTopByConversationOrderByCreatedAtDesc(conversation)
                    .ifPresentOrElse(
                            lastMsg -> {
                                conversation.setLastMessageId(lastMsg.getMessageId());
                                conversation.setLastMessageAt(lastMsg.getCreatedAt());
                            },
                            () -> {
                                conversation.setLastMessageId(null);
                                conversation.setLastMessageAt(null);
                            }
                    );

            conversationRepository.save(conversation);
        }
    }
}