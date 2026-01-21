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
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        conversation.setLastMessageId(message.getMessageId());
        conversation.setLastMessageAt(message.getCreatedAt());

        if (senderType == SenderType.STUDENT) {
            conversation.setInstructorUnreadCount(conversation.getInstructorUnreadCount() + 1);
        } else {
            conversation.setStudentUnreadCount(conversation.getStudentUnreadCount() + 1);
        }

        conversationRepository.save(conversation);
        return messageMapper.toResponse(message);
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

        Page<MessageEntity> messagesPage = messageRepository.findByConversationOrderByCreatedAtAsc(
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