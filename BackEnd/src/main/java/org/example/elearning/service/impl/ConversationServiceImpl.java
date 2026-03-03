package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.ConversationRequest;
import org.example.elearning.dto.response.ConversationResponse;
import org.example.elearning.dto.response.MessageResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.*;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BadRequestException;
import org.example.elearning.exception.exceptions.ForbiddenException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.ConversationMapper;
import org.example.elearning.mapper.MessageMapper;
import org.example.elearning.repository.*;
import org.example.elearning.service.ConversationService;
import org.example.elearning.specification.ConversationSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {
    EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    @Override
    public ConversationEntity findById(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CONVERSATION_NOT_FOUND.getMessage()));
    }


    private ConversationResponse mapToResponseWithLastMessage(ConversationEntity conv) {
        ConversationResponse response = conversationMapper.toResponse(conv);
        if (conv.getLastMessageId() != null) {
            messageRepository.findById(conv.getLastMessageId())
                    .ifPresent(msg -> {
                        response.setLastMessageContent(msg.getContent());
                        response.setLastMessageIsImage(msg.getImageUrl() != null && !msg.getImageUrl().isEmpty());
                        response.setLastMessageSenderId(msg.getSender().getUserId());
                        response.setLastMessageSenderType(msg.getSenderType().name());
                    });
        }
        return response;
    }


    private Specification<ConversationEntity> applyConversationFilters(
            Specification<ConversationEntity> baseSpec,
            Long courseId,
            String keyword,
            Boolean archived
    ) {
        Specification<ConversationEntity> spec = baseSpec;
        
        if (archived != null) {
            spec = spec.and(ConversationSpecification.isArchived(archived));
        }
        if (courseId != null) {
            spec = spec.and(ConversationSpecification.hasCourse(courseId));
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            spec = spec.and(ConversationSpecification.searchByKeyword(keyword));
        }
        
        return spec;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ConversationResponse> getMyConversations(
            Long userId,
            Long courseId,
            String keyword,
            Boolean archived,
            Pageable pageable
    ) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
        
        // Check if user is ADMIN - admins should use getAllConversations instead
        boolean isAdmin = userEntity.getRoles().stream()
                .anyMatch(role -> role.getRoleName().equals("ADMIN"));
        if (isAdmin) {
            throw new ForbiddenException(ErrorCode.ADMIN_ACCESS_WRONG_ENDPOINT.getMessage());
        }
        
        // Check if user is STUDENT or INSTRUCTOR
        boolean isStudent = userEntity.getRoles().stream()
                .anyMatch(role -> role.getRoleName().equals("STUDENT"));

        // Build base specification based on user role
        Specification<ConversationEntity> baseSpec;
        
        if (isStudent) {
            baseSpec = ConversationSpecification.byStudent(userId);
        } else {
            InstructorEntity instructor = instructorRepository.findByUser(userEntity)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.INSTRUCTOR_NOT_FOUND.getMessage()));
            baseSpec = ConversationSpecification.hasInstructor(instructor.getInstructorId());
        }
        
        // Apply common filters
        Specification<ConversationEntity> spec = applyConversationFilters(baseSpec, courseId, keyword, archived);
        
        // Execute query
        Page<ConversationEntity> conversationsPage = conversationRepository.findAll(spec, pageable);
        
        List<ConversationResponse> conversationResponses = conversationsPage.getContent().stream()
                .map(this::mapToResponseWithLastMessage)
                .toList();
        return new PaginatedResponse<>(conversationResponses, new PaginatedResponse.Pagination(
                conversationsPage.getNumber() + 1,
                conversationsPage.getSize(),
                conversationsPage.getTotalElements(),
                conversationsPage.getTotalPages()
        ));
    }


    @Override
    public PaginatedResponse<ConversationResponse> getAllConversations(
            Long courseId,
            Long instructorId,
            Long studentId,
            Boolean isArchived,
            Boolean isLocked,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String keyword,
            Pageable pageable
    ) {
        Specification<ConversationEntity> spec = ConversationSpecification.filterConversations(
                courseId,
                instructorId,
                studentId,
                isArchived,
                isLocked,
                startDate,
                endDate,
                keyword
        );

        Page<ConversationEntity> page = conversationRepository.findAll(spec, pageable);

        List<ConversationResponse> responses = page.getContent().stream()
                .map(this::mapToResponseWithLastMessage)
                .toList();

        return new PaginatedResponse<>(
                responses,
                new PaginatedResponse.Pagination(
                        page.getNumber() + 1,  // 1-indexed
                        page.getSize(),
                        page.getTotalElements(),
                        page.getTotalPages()
                )
        );
    }

    @Override
    public void markAsRead(Long conversationId, Long userId) {
        ConversationEntity conversation = findById(conversationId);

        boolean isStudent = conversation.getStudent().getUserId().equals(userId);
        if (isStudent) {
            conversation.setStudentUnreadCount(0);
        } else {
            conversation.setInstructorUnreadCount(0);
        }
        conversationRepository.save(conversation);
    }

    @Override
    public void setConversationArchived(Long conversationId, boolean isArchived) {
        ConversationEntity conversation = findById(conversationId);
        conversation.setIsArchived(isArchived);
        conversationRepository.save(conversation);
    }

    @Override
    public ConversationResponse getConversationDetail(Long conversationId) {
        ConversationEntity conversation = findById(conversationId);
        ConversationResponse conversationResponse = conversationMapper.toResponse(conversation);
        if (conversation.getLastMessageId() != null) {
            MessageEntity msg = messageRepository.findById(conversation.getLastMessageId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.MESSAGE_NOT_FOUND.getMessage()));
            
            conversationResponse.setLastMessageContent(msg.getContent());
            conversationResponse.setLastMessageIsImage(msg.getImageUrl() != null && !msg.getImageUrl().isEmpty());
        }
        return conversationResponse;
    }


    @Override
    public void setConversationLocked(Long conversationId, boolean locked) {
        ConversationEntity conversation = findById(conversationId);
        conversation.setIsLocked(locked);
        conversationRepository.save(conversation);
    }

    // ========== INSTRUCTOR METHODS ==========

    @Override
    public ConversationResponse createConversation(Long userId, Long courseId) {
        // Find user
        UserEntity student = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));

        // Find course
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.COURSE_NOT_FOUND.getMessage()));

        // Get instructor from course
        InstructorEntity instructor = course.getInstructor();
        if (instructor == null) {
            throw new BadRequestException("Khóa học chưa có giảng viên");
        }

        // Check if student is enrolled
        enrollmentRepository.findByCourse_CourseIdAndUser_UserId(courseId, userId)
                .orElseThrow(() -> new BadRequestException("Bạn chưa đăng ký khóa học này"));

        // Check if conversation already exists
        Optional<ConversationEntity> existingConv = conversationRepository
                .findByCourse_CourseIdAndStudent_UserIdAndInstructor_InstructorId(
                        courseId,
                        userId,
                        instructor.getInstructorId()
                );

        if (existingConv.isPresent()) {
            return conversationMapper.toResponse(existingConv.get());
        }

        // Create new conversation
        ConversationEntity conversation = ConversationEntity.builder()
                .student(student)
                .instructor(instructor)
                .course(course)
                .studentUnreadCount(0)
                .instructorUnreadCount(0)
                .isArchived(false)
                .isLocked(false)
                .build();

        conversation = conversationRepository.save(conversation);
        return conversationMapper.toResponse(conversation);
    }
    @Override
    public Long getUnreadCount(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));

        boolean isInstructor = user.getRoles().stream()
                .anyMatch(role -> role.getRoleName().equals("INSTRUCTOR"));

        if (isInstructor) {
            return conversationRepository.countInstructorUnreadMessages(userId);
        } else {
            return conversationRepository.countStudentUnreadMessages(userId);
        }
    }
}
