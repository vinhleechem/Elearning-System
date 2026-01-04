package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.SectionRequest;
import org.example.elearning.dto.response.SectionResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.SectionEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.SectionMapper;
import org.example.elearning.repository.SectionRepository;
import org.example.elearning.service.SectionService;
import org.example.elearning.service.CourseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SectionServiceImpl implements SectionService {

    SectionRepository sectionRepository;
    CourseService courseService;
    SectionMapper sectionMapper;

    @Override
    public List<SectionResponse> getSectionsByCourse(Long courseId) {
        CourseEntity course = courseService.getCourseEntityById(courseId);
        return sectionMapper.toResponseList(sectionRepository.findByCourseOrderByPositionAsc(course));
    }

    @Override
    @Transactional
    public SectionResponse createSection(Long courseId, SectionRequest request) {
        CourseEntity course = courseService.getCourseEntityById(courseId);

        Integer position = request.getPosition();
        if (position == null) {
            int currentSize = sectionRepository.findByCourseOrderByPositionAsc(course).size();
            position = currentSize + 1;
        }

        SectionEntity entity = sectionMapper.toEntity(request);
        entity.setCourse(course);
        entity.setPosition(position);

        return sectionMapper.toResponse(sectionRepository.save(entity));
    }

    @Override
    @Transactional
    public SectionResponse updateSection(Long sectionId, SectionRequest request) {
        SectionEntity entity = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));

        sectionMapper.updateEntity(entity, request);

        return sectionMapper.toResponse(sectionRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteSection(Long sectionId) {
        SectionEntity entity = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
        sectionRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public SectionEntity getSectionEntityById(Long sectionId) {
        return sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
    }
}
