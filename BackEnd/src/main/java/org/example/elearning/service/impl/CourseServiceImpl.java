package org.example.elearning.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.constant.KafkaTopics;
import org.example.elearning.constant.NotificationTemplate;
import org.example.elearning.dto.event.CourseEvent;
import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.request.NotificationRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.CourseMapper;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.service.CourseService;
import org.example.elearning.service.CategoryService;
import org.example.elearning.service.InstructorService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.PromotionService;
import org.example.elearning.service.NotificationService;
import org.example.elearning.specification.CourseSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseServiceImpl implements CourseService {

    CourseRepository courseRepository;
    CategoryService categoryService;
    InstructorService instructorService;
    CourseMapper courseMapper;
    UserService userService;
    EnrollmentRepository enrollmentRepository;
    PromotionService promotionService;
    NotificationService notificationService;
    KafkaTemplate<String, String> kafkaTemplate;
    ObjectMapper objectMapper;
    
    /**
     * Helper method to publish Kafka events
     */
    private void publishKafkaEvent(String eventType, Long courseId) {
        try {
            CourseEvent event = CourseEvent.builder()
                    .eventType(eventType)
                    .courseId(courseId)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            String jsonEvent = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(KafkaTopics.COURSE_EVENTS, courseId.toString(), jsonEvent)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("❌ Failed to send Kafka event: {} for course ID: {}", eventType, courseId, ex);
                        } else {
                            log.info("✅ Kafka event sent: {} - Course ID: {}", eventType, courseId);
                        }
                    });
        } catch (Exception e) {
            log.error("❌ Error publishing Kafka event: {} for course ID: {}", eventType, courseId, e);
        }
    }

    @Override
    @Transactional
    public PaginatedResponse<CourseResponse> getPublicCourses(Pageable pageable, String search, Long categoryId,
            String level) {
        var spec = CourseSpecification.publishedCourses();

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(CourseSpecification.filterByKeyword(search.trim()));
        }

        Page<CourseEntity> page = courseRepository.findAll(spec, pageable);

        var courseResponses = page.getContent().stream()
                .map(course -> {
                    CourseResponse response = courseMapper.toResponse(course);
                    promotionService.applyBestPromotionToCourse(response, course);
                    return response;
                })
                .toList();

        return new PaginatedResponse<>(courseResponses, new PaginatedResponse.Pagination(
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()));
    }

    /**
     * Enrich course response with user-specific context (purchase status)
     */
    private void enrichCourseWithUserContext(CourseResponse response, CourseEntity course) {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {
            String email = authentication.getName();
            UserEntity user = userService.getUserByEmail(email);
            enrollmentRepository.findByUserAndCourseAndIsDeletedFalse(user, course).ifPresent(enrollment -> {
                response.setIsPurchased(true);
                response.setPurchasedAt(enrollment.getCreatedAt());
            });
        }
    }

    @Override
    @Transactional
    public PaginatedResponse<CourseResponse> getAllCoursesForAdmin(Pageable pageable, String search,
            CourseStatus status) {
        var spec = CourseSpecification.notDeleted();

        if (status != null) {
            spec = spec.and(CourseSpecification.filterByStatus(status));
        }

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(CourseSpecification.filterByKeyword(search.trim()));
        }

        Page<CourseEntity> page = courseRepository.findAll(spec, pageable);

        var courseResponses = page.getContent().stream()
                .map(courseMapper::toResponse)
                .toList();

        return new PaginatedResponse<>(courseResponses, new PaginatedResponse.Pagination(
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()));
    }

    @Override
    @Transactional
    public CourseResponse getCourseBySlug(String slug) {
        CourseEntity entity = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        CourseResponse response = courseMapper.toResponse(entity);

        // Apply best promotion
        promotionService.applyBestPromotionToCourse(response, entity);

        // Enrich with user context (purchase status)
        enrichCourseWithUserContext(response, entity);

        return response;
    }

    @Override
    @Transactional
    public CourseResponse getCourseById(Long id) {
        CourseEntity entity = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return courseMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseEntity getCourseEntityById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.COURSE_NOT_FOUND.getMessage()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseEntity> getCourseEntitiesByIds(List<Long> ids) {
        return courseRepository.findAllById(ids);
    }

    @Override
    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        InstructorEntity instructor = instructorService.getInstructorEntityById(request.getInstructorId());
        CategoryEntity category = categoryService.getCategoryEntityById(request.getCategoryId());

        CourseEntity entity = courseMapper.toEntity(request);
        entity.setInstructor(instructor);
        entity.setCategory(category);
        entity.setStatus(CourseStatus.DRAFT);

        CourseEntity savedCourse = courseRepository.save(entity);
        
        // Publish Kafka event
        publishKafkaEvent("COURSE_CREATED", savedCourse.getCourseId());
        
        return courseMapper.toResponse(savedCourse);
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        CourseEntity entity = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        courseMapper.updateEntity(entity, request);

        if (request.getCategoryId() != null) {
            CategoryEntity category = categoryService.getCategoryEntityById(request.getCategoryId());
            entity.setCategory(category);
        }

        if (request.getInstructorId() != null) {
            InstructorEntity instructor = instructorService.getInstructorEntityById(request.getInstructorId());
            entity.setInstructor(instructor);
        }

        CourseEntity savedCourse = courseRepository.save(entity);
        
        // Publish Kafka event
        publishKafkaEvent("COURSE_UPDATED", savedCourse.getCourseId());
        
        return courseMapper.toResponse(savedCourse);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        CourseEntity entity = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        entity.setDeleted(true);
        courseRepository.save(entity);
        
        // Publish Kafka event
        publishKafkaEvent("COURSE_DELETED", id);
    }

    @Override
    @Transactional
    public PaginatedResponse<CourseResponse> getMyCourses(Pageable pageable, String search) {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }

        String email = authentication.getName();
        var user = userService.getUserByEmail(email);
        
        var instructorOptional = instructorService.findInstructorByUser(user);
        
        if (instructorOptional.isEmpty()) {
             return new PaginatedResponse<>(java.util.Collections.emptyList(), new PaginatedResponse.Pagination(
                pageable.getPageNumber() + 1,
                pageable.getPageSize(),
                0,
                0));
        }
        
        var instructor = instructorOptional.get();

        var spec = CourseSpecification.notDeleted()
                .and(CourseSpecification.filterByInstructorId(instructor.getInstructorId()));

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(CourseSpecification.filterByKeyword(search.trim()));
        }

        Page<CourseEntity> page = courseRepository.findAll(spec, pageable);

        var courseResponses = page.getContent().stream()
                .map(courseMapper::toResponse)
                .toList();

        return new PaginatedResponse<>(courseResponses, new PaginatedResponse.Pagination(
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()));
    }
    @Override
    @Transactional
    public void submitCourseForApproval(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        String email = authentication.getName();
        var user = userService.getUserByEmail(email);
        
        // Check if course belongs to the instructor
        if (!course.getInstructor().getUser().getUserId().equals(user.getUserId())) {
             throw new org.springframework.security.access.AccessDeniedException("You are not the owner of this course");
        }

        if (course.getStatus() != CourseStatus.DRAFT && course.getStatus() != CourseStatus.REJECTED) {
            throw new IllegalStateException("Only Draft or Rejected courses can be submitted for approval");
        }

        course.setStatus(CourseStatus.PENDING);
        courseRepository.save(course);

        // Notify all admins about course approval request
        notifyAdminsForCourseApproval(course);
    }

    @Override
    @Transactional
    public void approveCourse(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getStatus() != CourseStatus.PENDING) {
            throw new IllegalStateException("Course is not waiting for approval");
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setPublishedAt(LocalDateTime.now());
        courseRepository.save(course);
        
        // Notify instructor about approval
        notifyInstructorCourseApproved(course);
        
        // Publish Kafka event
        publishKafkaEvent("COURSE_PUBLISHED", id);
    }

    @Override
    @Transactional
    public void rejectCourse(Long id, String reason) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getStatus() != CourseStatus.PENDING) {
            throw new IllegalStateException("Course is not waiting for approval");
        }

        course.setStatus(CourseStatus.REJECTED);
        courseRepository.save(course);
        
        // Notify instructor about rejection
        notifyInstructorCourseRejected(course, reason != null ? reason : "Không có lý do cụ thể");
        
        // Publish Kafka event (unpublish)
        publishKafkaEvent("COURSE_UNPUBLISHED", id);
    }

    /**
     * Helper method to notify all admins about course approval request
     */
    private void notifyAdminsForCourseApproval(CourseEntity course) {
        List<UserEntity> admins = userService.findAllAdmins();
        log.info("Notifying {} admins about course approval request for course ID: {}", 
                admins.size(), course.getCourseId());

        String instructorName = course.getInstructor().getUser().getFullName();
        String courseTitle = course.getTitle();

        for (UserEntity admin : admins) {
            log.debug("Creating notification for admin: {}", admin.getEmail());
            NotificationRequest notification = NotificationRequest.builder()
                    .title(NotificationTemplate.COURSE_APPROVAL_REQUEST_TITLE)
                    .message(NotificationTemplate.buildCourseApprovalRequestMessage(instructorName, courseTitle))
                    .type(NotificationTemplate.TYPE_SYSTEM)
                    .userId(admin.getUserId())
                    .link(NotificationTemplate.buildAdminCourseLink(course.getCourseId()))
                    .build();
            
            notificationService.createAndSendNotification(notification);
        }
        
        log.info("Successfully notified {} admins", admins.size());
    }

    /**
     * Helper method to notify instructor about course approval
     */
    private void notifyInstructorCourseApproved(CourseEntity course) {
        UserEntity instructor = course.getInstructor().getUser();
        log.info("Notifying instructor {} about course approval: {}", 
                instructor.getEmail(), course.getCourseId());

        NotificationRequest notification = NotificationRequest.builder()
                .title(NotificationTemplate.COURSE_APPROVED_TITLE)
                .message(NotificationTemplate.buildCourseApprovedMessage(course.getTitle()))
                .type(NotificationTemplate.TYPE_COURSE)
                .userId(instructor.getUserId())
                .link(NotificationTemplate.buildInstructorCourseLink(course.getCourseId()))
                .build();
        
        notificationService.createAndSendNotification(notification);
    }

    /**
     * Helper method to notify instructor about course rejection
     */
    private void notifyInstructorCourseRejected(CourseEntity course, String reason) {
        UserEntity instructor = course.getInstructor().getUser();
        log.info("Notifying instructor {} about course rejection: {}", 
                instructor.getEmail(), course.getCourseId());

        NotificationRequest notification = NotificationRequest.builder()
                .title(NotificationTemplate.COURSE_REJECTED_TITLE)
                .message(NotificationTemplate.buildCourseRejectedMessage(course.getTitle(), reason))
                .type(NotificationTemplate.TYPE_COURSE)
                .userId(instructor.getUserId())
                .link(NotificationTemplate.buildInstructorCourseLink(course.getCourseId()))
                .build();
        
        notificationService.createAndSendNotification(notification);
    }
}
