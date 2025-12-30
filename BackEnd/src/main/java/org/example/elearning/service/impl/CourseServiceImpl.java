package org.example.elearning.service.impl;

import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.CourseMapper;
import org.example.elearning.repository.CategoryRepository;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.repository.PromotionRepository;
import org.example.elearning.service.CourseService;
import org.example.elearning.specification.CourseSpecification;
import org.example.elearning.entity.PromotionEntity;
import org.example.elearning.entity.PromotionRuleEntity;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.PromotionRuleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseServiceImpl implements CourseService {

    CourseRepository courseRepository;
    CategoryRepository categoryRepository;
    InstructorRepository instructorRepository;
    CourseMapper courseMapper;
    UserRepository userRepository;
    EnrollmentRepository enrollmentRepository;
    PromotionRepository promotionRepository;

    @Override
    @Transactional
    public PaginatedResponse<CourseResponse> getPublicCourses(Pageable pageable, String search, Long categoryId,
            String level) {
        var spec = CourseSpecification.publishedCourses();

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(CourseSpecification.filterByKeyword(search.trim()));
        }

        Page<CourseEntity> page = courseRepository.findAll(spec, pageable);

        // Fetch active promotions
        List<PromotionEntity> activePromotions = promotionRepository.findActivePromotions(LocalDateTime.now());

        var courseResponses = page.getContent().stream()
                .map(course -> {
                    CourseResponse response = courseMapper.toResponse(course);
                    applyBestPromotion(response, course, activePromotions);
                    return response;
                })
                .toList();

        return new PaginatedResponse<>(courseResponses, new PaginatedResponse.Pagination(
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()));
    }

    private void applyBestPromotion(CourseResponse response, CourseEntity course,
            List<PromotionEntity> activePromotions) {
        if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        BigDecimal bestDiscountAmount = BigDecimal.ZERO;
        PromotionEntity bestPromotion = null;

        for (PromotionEntity promotion : activePromotions) {
            for (PromotionRuleEntity rule : promotion.getRules()) {
                if (isRuleApplicable(rule, course)) {
                    BigDecimal discountAmount = calculateDiscountAmount(rule, course.getPrice());
                    if (discountAmount.compareTo(bestDiscountAmount) > 0) {
                        bestDiscountAmount = discountAmount;
                        bestPromotion = promotion;
                    }
                }
            }
        }

        if (bestPromotion != null) {
            response.setPromotionName(bestPromotion.getName());
            response.setPromotionType(bestPromotion.getPromotionType().name());
            response.setPromotionEndDate(bestPromotion.getEndDate());

            BigDecimal finalPrice = course.getPrice().subtract(bestDiscountAmount);
            if (finalPrice.compareTo(BigDecimal.ZERO) < 0)
                finalPrice = BigDecimal.ZERO;

            response.setDiscountPrice(finalPrice);

            // Calculate percentage
            int percentage = bestDiscountAmount.divide(course.getPrice(), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100)).intValue();
            response.setDiscountPercentage(percentage);
        }
    }

    private boolean isRuleApplicable(PromotionRuleEntity rule, CourseEntity course) {
        if (rule.getRuleType() == PromotionRuleType.ALL) {
            return true;
        }
        if (rule.getRuleType() == PromotionRuleType.COURSE) {
            return rule.getTargetId() != null && rule.getTargetId().equals(course.getCourseId());
        }
        if (rule.getRuleType() == PromotionRuleType.CATEGORY) {
            return rule.getTargetId() != null && rule.getTargetId().equals(course.getCategory().getId());
        }
        return false;
    }

    private BigDecimal calculateDiscountAmount(PromotionRuleEntity rule, BigDecimal price) {
        if (rule.getDiscountType() == DiscountType.FIXED) {
            return rule.getDiscountValue();
        } else {
            BigDecimal discount = price.multiply(rule.getDiscountValue().divide(new BigDecimal(100)));
            if (rule.getMaxDiscountAmount() != null && discount.compareTo(rule.getMaxDiscountAmount()) > 0) {
                return rule.getMaxDiscountAmount();
            }
            return discount;
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

        // Apply active promotions
        List<PromotionEntity> activePromotions = promotionRepository.findActivePromotions(LocalDateTime.now());
        applyBestPromotion(response, entity, activePromotions);

        // Check if user is logged in
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {
            String email = authentication.getName();
            userRepository.findByEmail(email).ifPresent(user -> {
                enrollmentRepository.findByUserAndCourseAndIsDeletedFalse(user, entity).ifPresent(enrollment -> {
                    response.setIsPurchased(true);
                    response.setPurchasedAt(enrollment.getCreatedAt());
                });
            });
        }

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
    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        InstructorEntity instructor = instructorRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        CourseEntity entity = courseMapper.toEntity(request);
        entity.setInstructor(instructor);
        entity.setCategory(category);
        entity.setStatus(CourseStatus.DRAFT);

        return courseMapper.toResponse(courseRepository.save(entity));
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        CourseEntity entity = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        courseMapper.updateEntity(entity, request);

        if (request.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            entity.setCategory(category);
        }

        if (request.getInstructorId() != null) {
            InstructorEntity instructor = instructorRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
            entity.setInstructor(instructor);
        }

        return courseMapper.toResponse(courseRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        CourseEntity entity = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        entity.setDeleted(true);
        courseRepository.save(entity);
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
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        var instructorOptional = instructorRepository.findByUser(user);
        
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
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if course belongs to the instructor
        if (!course.getInstructor().getUser().getUserId().equals(user.getUserId())) {
             throw new org.springframework.security.access.AccessDeniedException("You are not the owner of this course");
        }

        if (course.getStatus() != CourseStatus.DRAFT && course.getStatus() != CourseStatus.REJECTED) {
            throw new IllegalStateException("Only Draft or Rejected courses can be submitted for approval");
        }

        course.setStatus(CourseStatus.WAITING_FOR_APPROVAL);
        courseRepository.save(course);
    }

    @Override
    @Transactional
    public void approveCourse(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getStatus() != CourseStatus.WAITING_FOR_APPROVAL) {
            throw new IllegalStateException("Course is not waiting for approval");
        }

        course.setStatus(CourseStatus.PUBLISHED);
        course.setPublishedAt(LocalDateTime.now());
        courseRepository.save(course);
    }

    @Override
    @Transactional
    public void rejectCourse(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getStatus() != CourseStatus.WAITING_FOR_APPROVAL) {
            throw new IllegalStateException("Course is not waiting for approval");
        }

        course.setStatus(CourseStatus.REJECTED);
        courseRepository.save(course);
    }
}
