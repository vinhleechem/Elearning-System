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

    @Override
    public ConversationResponse createConversation(ConversationRequest request, Long studentId) {
        EnrollmentEntity enrollment = enrollmentRepository
                .findByCourse_CourseIdAndUser_UserId(request.getCourseId(), studentId)
                .orElseThrow(() -> new BadRequestException(ErrorCode.ENROLLMENT_NOT_FOUND.getMessage()));
        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.COURSE_NOT_FOUND.getMessage()));

        InstructorEntity instructor = instructorRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.INSTRUCTOR_NOT_FOUND.getMessage()));

        if (!course.getInstructor().getInstructorId().equals(instructor.getInstructorId())) {
            throw new ForbiddenException(ErrorCode.INSTRUCTOR_NOT_ASSIGNED_TO_COURSE.getMessage());
        }
        Optional<ConversationEntity> existingConv = conversationRepository
                .findByCourse_CourseIdAndStudent_UserIdAndInstructor_InstructorId(
                        request.getCourseId(),
                        studentId,
                        request.getInstructorId()
                );

        if (existingConv.isPresent()) {
            // Đã có rồi, trả về conversation hiện tại
            return conversationMapper.toResponse(existingConv.get());
        }
        UserEntity student = enrollment.getUser();
        ConversationEntity conversation = conversationMapper.toEntity(request);
        conversation.setStudent(student);
        conversation.setInstructor(instructor);
        conversation.setCourse(course);

        return conversationMapper.toResponse(conversationRepository.save(conversation));
    }

    @Override
    public PaginatedResponse<ConversationResponse> getMyConversations(Long userId, boolean archived, Pageable pageable) {
        UserEntity userEntity = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
        boolean isStudent = userEntity.getRoles().stream().anyMatch(role -> role.getRoleName().equals("STUDENT"));
        Page<ConversationEntity> conversationsPage;
        if (isStudent) {
            conversationsPage = conversationRepository.findMyConversationsByStudent(userId, archived, pageable);
        } else {
            InstructorEntity instructor = instructorRepository.findByUser(userEntity)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.INSTRUCTOR_NOT_FOUND.getMessage()));
            conversationsPage = conversationRepository.findMyConversationsByInstructor(instructor.getInstructorId(), archived, pageable);
        }
        List<ConversationResponse> conversationResponses = conversationsPage.getContent().stream()
                .map(conversationMapper::toResponse)
                .toList();
        return new PaginatedResponse<>(conversationResponses, new PaginatedResponse.Pagination(
                conversationsPage.getNumber() + 1,
                conversationsPage.getSize(),
                conversationsPage.getTotalElements(),
                conversationsPage.getTotalPages(
                )));
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
                .map(conv -> {
                    ConversationResponse response = conversationMapper.toResponse(conv);
                    if (conv.getLastMessageId() != null) {
                        messageRepository.findById(conv.getLastMessageId())
                                .ifPresent(msg -> response.setLastMessageContent(msg.getContent()));
                    }
                    return response;
                })
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
    public ConversationResponse getConversationDetail(Long conversationId) {
        ConversationEntity conversation = findById(conversationId);
        ConversationResponse conversationResponse = conversationMapper.toResponse(conversation);
        if (conversation.getLastMessageId() != null) {
            conversationResponse.setLastMessageContent(
                    messageRepository.findById(conversation.getLastMessageId())
                            .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.MESSAGE_NOT_FOUND.getMessage()))
                            .getContent()
            );
        }
        return conversationResponse;
    }


    @Override
    public void setConversationLocked(Long conversationId, boolean locked) {
        ConversationEntity conversation = findById(conversationId);
        conversation.setIsLocked(locked);
        conversationRepository.save(conversation);
    }

}
