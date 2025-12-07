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
import org.example.elearning.service.CourseService;
import org.example.elearning.specification.CourseSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional
    public PaginatedResponse<CourseResponse> getPublicCourses(Pageable pageable, String search, Long categoryId, String level) {
        var spec = CourseSpecification.publishedCourses();

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
                page.getTotalPages()
        ));
    }

    @Override
    @Transactional
    public PaginatedResponse<CourseResponse> getAllCoursesForAdmin(Pageable pageable, String search, CourseStatus status) {
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
                page.getTotalPages()
        ));
    }

    @Override
    @Transactional
    public CourseResponse getCourseBySlug(String slug) {
        CourseEntity entity = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return courseMapper.toResponse(entity);
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

}


