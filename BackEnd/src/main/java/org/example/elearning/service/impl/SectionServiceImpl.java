package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.SectionRequest;
import org.example.elearning.dto.response.SectionResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.SectionEntity;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.SectionRepository;
import org.example.elearning.service.SectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SectionServiceImpl implements SectionService {

    SectionRepository sectionRepository;
    CourseRepository courseRepository;

    @Override
    public List<SectionResponse> getSectionsByCourse(Long courseId) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return sectionRepository.findByCourseOrderByPositionAsc(course)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public SectionResponse createSection(Long courseId, SectionRequest request) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Integer position = request.getPosition();
        if (position == null) {
            // đơn giản: để null hoặc tính theo số lượng hiện tại
            int currentSize = sectionRepository.findByCourseOrderByPositionAsc(course).size();
            position = currentSize + 1;
        }

        SectionEntity entity = SectionEntity.builder()
                .course(course)
                .title(request.getTitle())
                .position(position)
                .build();

        return toResponse(sectionRepository.save(entity));
    }

    @Override
    @Transactional
    public SectionResponse updateSection(Long sectionId, SectionRequest request) {
        SectionEntity entity = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        if (request.getTitle() != null) {
            entity.setTitle(request.getTitle());
        }
        if (request.getPosition() != null) {
            entity.setPosition(request.getPosition());
        }

        return toResponse(sectionRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteSection(Long sectionId) {
        SectionEntity entity = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        sectionRepository.delete(entity);
    }

    private SectionResponse toResponse(SectionEntity entity) {
        return SectionResponse.builder()
                .sectionId(entity.getSectionId())
                .courseId(entity.getCourse().getCourseId())
                .title(entity.getTitle())
                .position(entity.getPosition())
                .build();
    }
}


