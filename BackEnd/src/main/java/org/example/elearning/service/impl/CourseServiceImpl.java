package org.example.elearning.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.constant.KafkaTopics;
import org.example.elearning.constant.NotificationTemplate;
import org.example.elearning.dto.event.CourseEvent;
import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.request.CourseUpdateRequest;
import org.example.elearning.dto.request.NotificationRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.entity.SectionEntity;
import org.example.elearning.entity.LessonEntity;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.enums.CourseLevel;
import org.example.elearning.enums.ContentType;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BadRequestException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.CourseMapper;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.repository.SectionRepository;
import org.example.elearning.repository.LessonRepository;
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
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.InputStream;   
import java.io.IOException;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;   
import java.util.UUID;        
import java.util.Map;
import java.util.HashMap;
import java.util.regex.Pattern;
import java.text.Normalizer;  

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
    SectionRepository sectionRepository;
    LessonRepository lessonRepository;
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
    public PaginatedResponse<CourseResponse> getPublicCourses(
            Pageable pageable, 
            String search, 
            Long categoryId,
            CourseLevel level,
            Double minPrice,
            Double maxPrice,
            Double minRating) {
        
        // Start with published courses
        var spec = CourseSpecification.publishedCourses();

        // Apply search filter
        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(CourseSpecification.filterByKeyword(search.trim()));
        }

        // Apply category filter
        if (categoryId != null) {
            spec = spec.and(CourseSpecification.filterByCategoryId(categoryId));
        }

        // Apply level filter
        if (level != null) {
            spec = spec.and(CourseSpecification.filterByLevel(level));
        }

        // Apply price range filters
        if (minPrice != null) {
            spec = spec.and(CourseSpecification.filterByMinPrice(minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and(CourseSpecification.filterByMaxPrice(maxPrice));
        }

        // Apply rating filter
        if (minRating != null) {
            spec = spec.and(CourseSpecification.filterByMinRating(minRating));
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

        // Validate: Chỉ cho phép chọn category cấp 3
        if (!categoryService.isLevel3Category(request.getCategoryId())) {
            throw new BadRequestException(
                ErrorCode.INVALID_CATEGORY_LEVEL.getMessage()
            );
        }

        CourseEntity entity = courseMapper.toEntity(request);
        entity.setInstructor(instructor);
        entity.setCategory(category);
        entity.setStatus(CourseStatus.DRAFT);
        
        // Auto-generate slug if not provided
        if (entity.getSlug() == null || entity.getSlug().trim().isEmpty()) {
            String slugBase = toSlug(entity.getTitle());
            if (slugBase.isEmpty()) slugBase = "course";
            
            // Check for duplicate slugs and append number if needed
            String finalSlug = slugBase;
            int counter = 2;
            while (courseRepository.findBySlug(finalSlug).isPresent()) {
                finalSlug = slugBase + "-" + counter;
                counter++;
            }
            entity.setSlug(finalSlug);
        }

        CourseEntity savedCourse = courseRepository.save(entity);
        
        // Publish Kafka event
        publishKafkaEvent("COURSE_CREATED", savedCourse.getCourseId());
        
        return courseMapper.toResponse(savedCourse);
    }


    @Override
    @Transactional
    public CourseResponse updateCourse(Long id, CourseUpdateRequest request) {
        CourseEntity entity = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        courseMapper.updateEntity(entity, request);

        if (request.getCategoryId() != null) {
            // Validate: Chỉ cho phép chọn category cấp 3
            if (!categoryService.isLevel3Category(request.getCategoryId())) {
                throw new org.example.elearning.exception.exceptions.BadRequestException(
                    "Bạn phải chọn danh mục cấp 3 (ví dụ: Lập trình > Java > Spring Boot). " +
                    "Vui lòng chọn danh mục cụ thể nhất để phân loại khóa học chính xác."
                );
            }
            
            CategoryEntity category = categoryService.getCategoryEntityById(request.getCategoryId());
            entity.setCategory(category);
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

    @Override
    @Transactional
    public CourseResponse updateCourseStatus(Long id, CourseStatus status) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        course.setStatus(status);
        if (status == CourseStatus.PUBLISHED && course.getPublishedAt() == null) {
             course.setPublishedAt(LocalDateTime.now());
        }
        
        CourseEntity savedCourse = courseRepository.save(course);
        return courseMapper.toResponse(savedCourse);
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

    @Override
    @Transactional
    public void importCourses(MultipartFile file) throws IOException {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity currentUser = userService.getUserByEmail(username);
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getRoleName().equals("ADMIN"));
        
        var currentInstructor = instructorService.findInstructorByUser(currentUser).orElse(null);
        
        if (!isAdmin && currentInstructor == null) {
             throw new RuntimeException("Bạn phải là giảng viên hoặc Admin mới có thể import khóa học");
        }

        Map<String, CourseEntity> courseMap = new HashMap<>();

        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(inputStream);
            
            // 1. Process Courses Sheet
            Sheet courseSheet = workbook.getSheetAt(0);
            for (int i = 1; i <= courseSheet.getLastRowNum(); i++) {
                Row row = courseSheet.getRow(i);
                if (row == null) continue;

                String title = getCellValueAsString(row.getCell(0));
                if (title == null || title.trim().isEmpty()) continue;

                CourseEntity course = new CourseEntity();
                course.setTitle(title);
                
                String slugBase = toSlug(title);
                if (slugBase.isEmpty()) slugBase = "course";
                course.setSlug(slugBase + "-" + UUID.randomUUID().toString().substring(0, 8));

                course.setPrice(getCellValueAsBigDecimal(row.getCell(1)));

                Long categoryId = getCellValueAsLong(row.getCell(2));
                CategoryEntity category = null;
                if (categoryId != null) {
                    try {
                        category = categoryService.getCategoryEntityById(categoryId);
                    } catch (Exception e) {}
                }
                if (category == null) {
                     try { category = categoryService.getCategoryEntityById(1L); } catch(Exception e) {}
                }
                if (category == null) continue;
                course.setCategory(category);
                
                course.setDescription(getCellValueAsString(row.getCell(3)));
                course.setShortDescription(getCellValueAsString(row.getCell(3)));
                
                String levelStr = getCellValueAsString(row.getCell(4));
                CourseLevel level = CourseLevel.BEGINNER; // Default
                if (levelStr != null && !levelStr.isEmpty()) {
                    try {
                        level = CourseLevel.valueOf(levelStr.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid level '{}', using BEGINNER as default", levelStr);
                    }
                }
                course.setLevel(level);
                
                String language = getCellValueAsString(row.getCell(5));
                course.setLanguage(language != null && !language.isEmpty() ? language : "Tiếng Việt");

                Long specifiedInstructorId = getCellValueAsLong(row.getCell(6));
                InstructorEntity instructor = null;
                if (isAdmin && specifiedInstructorId != null) {
                    try {
                        instructor = instructorService.getInstructorEntityById(specifiedInstructorId);
                    } catch (Exception e) {}
                }
                if (instructor == null) instructor = currentInstructor;
                if (instructor == null) continue;

                course.setInstructor(instructor);
                course.setStatus(CourseStatus.DRAFT);
                course.setThumbnailUrl("");
                
                course = courseRepository.save(course);
                courseMap.put(title, course);
                publishKafkaEvent("COURSE_CREATED", course.getCourseId());
            }

            // 2. Process Sections Sheet (if exist)
            Map<String, SectionEntity> sectionMap = new HashMap<>();
            if (workbook.getNumberOfSheets() > 1) {
                Sheet sectionSheet = workbook.getSheetAt(1);
                for (int i = 1; i <= sectionSheet.getLastRowNum(); i++) {
                    Row row = sectionSheet.getRow(i);
                    if (row == null) continue;
                    
                    String courseTitle = getCellValueAsString(row.getCell(0));
                    String sectionTitle = getCellValueAsString(row.getCell(1));
                    Integer position = getCellValueAsLong(row.getCell(2)) != null ? getCellValueAsLong(row.getCell(2)).intValue() : 1;
                    
                    CourseEntity course = courseMap.get(courseTitle);
                    if (course != null && sectionTitle != null) {
                        SectionEntity section = SectionEntity.builder()
                                .course(course)
                                .title(sectionTitle)
                                .position(position)
                                .build();
                        section = sectionRepository.save(section);
                        sectionMap.put(courseTitle + "||" + sectionTitle, section);
                    }
                }
            }

            // 3. Process Lessons Sheet (if exist)
            if (workbook.getNumberOfSheets() > 2) {
                Sheet lessonSheet = workbook.getSheetAt(2);
                for (int i = 1; i <= lessonSheet.getLastRowNum(); i++) {
                    Row row = lessonSheet.getRow(i);
                    if (row == null) continue;
                    
                    String courseTitle = getCellValueAsString(row.getCell(0));
                    String sectionTitle = getCellValueAsString(row.getCell(1));
                    String lessonTitle = getCellValueAsString(row.getCell(2));
                    String typeStr = getCellValueAsString(row.getCell(3));
                    Long videoAssetId = getCellValueAsLong(row.getCell(4));
                    String content = getCellValueAsString(row.getCell(5));
                    Integer duration = getCellValueAsLong(row.getCell(6)) != null ? getCellValueAsLong(row.getCell(6)).intValue() : 0;
                    Integer sortOrder = getCellValueAsLong(row.getCell(7)) != null ? getCellValueAsLong(row.getCell(7)).intValue() : 1;

                    SectionEntity section = sectionMap.get(courseTitle + "||" + sectionTitle);
                    if (section != null && lessonTitle != null) {
                        LessonEntity lesson = LessonEntity.builder()
                                .section(section)
                                .title(lessonTitle)
                                .type(typeStr != null && typeStr.equalsIgnoreCase("ARTICLE") ? ContentType.ARTICLE : ContentType.VIDEO)
                                .videoAssetId(videoAssetId)
                                .sortOrder(sortOrder)
                                .isActive(true)
                                .isPreview(false)
                                .isDownloadable(true)
                                .build();
                        
                        if (lesson.getType() == ContentType.VIDEO) {
                            lesson.setVideoUrl(content);
                            lesson.setDurationSeconds(duration);
                        } else {
                            lesson.setArticleContent(content);
                        }
                        lessonRepository.save(lesson);
                    }
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCourses() throws IOException {
        List<CourseEntity> courses = courseRepository.findAllByIsDeletedFalse();
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // --- Sheet 1: Courses ---
            Sheet courseSheet = workbook.createSheet("Courses");
            String[] courseColumns = {
                "Tiêu đề", "Giá", "ID Danh mục", "Mô tả", "Cấp độ", "Ngôn ngữ", "ID Giảng viên",
                "ID Khóa học", "Slug", "Giảng viên", "Danh mục", "Trạng thái"
            };
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row courseHeader = courseSheet.createRow(0);
            for (int i = 0; i < courseColumns.length; i++) {
                Cell cell = courseHeader.createCell(i);
                cell.setCellValue(courseColumns[i]);
                cell.setCellStyle(headerStyle);
            }

            int courseRowIdx = 1;
            int sectionRowIdx = 1;
            int lessonRowIdx = 1;
            
            // --- Sheet 2: Sections ---
            Sheet sectionSheet = workbook.createSheet("Sections");
            String[] sectionColumns = {"Course Title", "Section Title", "Position"};
            Row sectionHeader = sectionSheet.createRow(0);
            for (int i = 0; i < sectionColumns.length; i++) {
                Cell cell = sectionHeader.createCell(i);
                cell.setCellValue(sectionColumns[i]);
                cell.setCellStyle(headerStyle);
            }

            // --- Sheet 3: Lessons ---
            Sheet lessonSheet = workbook.createSheet("Lessons");
            String[] lessonColumns = {"Course Title", "Section Title", "Lesson Title", "Type", "Video Asset ID", "Content (URL/Article)", "Duration (sec)", "Sort Order"};
            Row lessonHeader = lessonSheet.createRow(0);
            for (int i = 0; i < lessonColumns.length; i++) {
                Cell cell = lessonHeader.createCell(i);
                cell.setCellValue(lessonColumns[i]);
                cell.setCellStyle(headerStyle);
            }

            for (CourseEntity course : courses) {
                // Fill Course
                Row row = courseSheet.createRow(courseRowIdx++);
                row.createCell(0).setCellValue(course.getTitle());
                row.createCell(1).setCellValue(course.getPrice() != null ? course.getPrice().doubleValue() : 0.0);
                row.createCell(2).setCellValue(course.getCategory() != null ? course.getCategory().getId() : 0L);
                row.createCell(3).setCellValue(course.getDescription());
                row.createCell(4).setCellValue(course.getLevel() != null ? course.getLevel().name() : "BEGINNER");
                row.createCell(5).setCellValue(course.getLanguage());
                row.createCell(6).setCellValue(course.getInstructor() != null ? course.getInstructor().getInstructorId() : 0L);
                row.createCell(7).setCellValue(course.getCourseId());
                row.createCell(8).setCellValue(course.getSlug());
                row.createCell(9).setCellValue(course.getInstructor() != null ? course.getInstructor().getUser().getFullName() : "N/A");
                row.createCell(10).setCellValue(course.getCategory() != null ? course.getCategory().getName() : "N/A");
                row.createCell(11).setCellValue(course.getStatus().name());

                // Fill Sections & Lessons
                List<SectionEntity> sections = sectionRepository.findByCourseOrderByPositionAsc(course);
                for (SectionEntity section : sections) {
                    Row sRow = sectionSheet.createRow(sectionRowIdx++);
                    sRow.createCell(0).setCellValue(course.getTitle());
                    sRow.createCell(1).setCellValue(section.getTitle());
                    sRow.createCell(2).setCellValue(section.getPosition() != null ? section.getPosition() : 0);

                    List<LessonEntity> lessons = lessonRepository.findBySectionOrderBySortOrderAsc(section);
                    for (LessonEntity lesson : lessons) {
                        Row lRow = lessonSheet.createRow(lessonRowIdx++);
                        lRow.createCell(0).setCellValue(course.getTitle());
                        lRow.createCell(1).setCellValue(section.getTitle());
                        lRow.createCell(2).setCellValue(lesson.getTitle());
                        lRow.createCell(3).setCellValue(lesson.getType().name());
                        lRow.createCell(4).setCellValue(lesson.getVideoAssetId() != null ? lesson.getVideoAssetId() : 0L);
                        lRow.createCell(5).setCellValue(lesson.getType() == ContentType.VIDEO ? lesson.getVideoUrl() : lesson.getArticleContent());
                        lRow.createCell(6).setCellValue(lesson.getDurationSeconds() != null ? lesson.getDurationSeconds() : 0);
                        lRow.createCell(7).setCellValue(lesson.getSortOrder() != null ? lesson.getSortOrder() : 0);
                    }
                }
            }

            // Auto-size basic columns
            for (int i = 0; i < 3; i++) {
                courseSheet.autoSizeColumn(i);
                sectionSheet.autoSizeColumn(i);
                lessonSheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue();
                case NUMERIC -> String.valueOf((long)cell.getNumericCellValue());
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                default -> "";
            };
        } catch (Exception e) { return ""; }
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return BigDecimal.ZERO;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                return new BigDecimal(cell.getStringCellValue());
            }
        } catch (Exception e) { return BigDecimal.ZERO; }
        return BigDecimal.ZERO;
    }

    private Long getCellValueAsLong(Cell cell) {
        if (cell == null) return null;
        try {
             if (cell.getCellType() == CellType.NUMERIC) {
                return (long) cell.getNumericCellValue();
            } else if (cell.getCellType() == CellType.STRING) {
                return Long.parseLong(cell.getStringCellValue());
            }
        } catch (Exception e) { return null; }
        return null;
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = Pattern.compile("[\\s]").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase();
    }
}
