package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.CourseMapper;
import org.example.elearning.repository.CategoryRepository;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.service.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseServiceImpl implements CourseService {

    CourseRepository courseRepository;
    CategoryRepository categoryRepository;
    InstructorRepository instructorRepository;
    CourseMapper courseMapper;

    @Override
    public Page<CourseResponse> getPublicCourses(Pageable pageable, String search, Long categoryId, String level) {
        Page<CourseEntity> page;
        if (search != null && !search.trim().isEmpty()) {
            page = courseRepository.findByTitleContainingIgnoreCaseAndIsDeletedFalse(search.trim(), pageable);
        } else {
            page = courseRepository.findByStatusAndIsDeletedFalse(CourseStatus.PUBLISHED, pageable);
        }
        return page.map(courseMapper::toResponse);
    }

    @Override
    public CourseResponse getCourseBySlug(String slug) {
        CourseEntity entity = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return courseMapper.toResponse(entity);
    }

    @Override
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

        CourseEntity entity = CourseEntity.builder()
                .instructor(instructor)
                .category(category)
                .title(request.getTitle())
                .slug(request.getSlug())
                .shortDescription(request.getShortDescription())
                .description(request.getDescription())
                .whatYouLearn(request.getWhatYouLearn())
                .requirements(request.getRequirements())
                .targetAudience(request.getTargetAudience())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .language(request.getLanguage())
                .level(request.getLevel())
                .hasCertificate(request.getHasCertificate())
                .status(CourseStatus.DRAFT)
                .build();

        return courseMapper.toResponse(courseRepository.save(entity));
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        CourseEntity entity = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (request.getTitle() != null) entity.setTitle(request.getTitle());
        if (request.getSlug() != null) entity.setSlug(request.getSlug());
        if (request.getShortDescription() != null) entity.setShortDescription(request.getShortDescription());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getWhatYouLearn() != null) entity.setWhatYouLearn(request.getWhatYouLearn());
        if (request.getRequirements() != null) entity.setRequirements(request.getRequirements());
        if (request.getTargetAudience() != null) entity.setTargetAudience(request.getTargetAudience());
        if (request.getPrice() != null) entity.setPrice(request.getPrice());
        if (request.getDiscountPrice() != null) entity.setDiscountPrice(request.getDiscountPrice());
        if (request.getLanguage() != null) entity.setLanguage(request.getLanguage());
        if (request.getLevel() != null) entity.setLevel(request.getLevel());
        if (request.getHasCertificate() != null) entity.setHasCertificate(request.getHasCertificate());

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

}


