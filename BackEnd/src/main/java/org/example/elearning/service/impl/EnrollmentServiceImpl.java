package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.EnrollmentResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.EnrollmentEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BadRequestException;
import org.example.elearning.exception.exceptions.ForbiddenException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.service.EnrollmentService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.CourseService;
import org.example.elearning.mapper.EnrollmentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {
    EnrollmentRepository enrollmentRepository;
    UserService userService;
    CourseService courseService;
    EnrollmentMapper enrollmentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments() {
        UserEntity user = userService.getCurrentUser();

        List<EnrollmentEntity> enrollments = enrollmentRepository.findByUser(user);

        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollmentDetail(Long enrollmentId) {
        UserEntity user = userService.getCurrentUser();

        EnrollmentEntity enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENROLLMENT_NOT_FOUND.getMessage()));

        if (!enrollment.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN.getMessage());
        }

        return mapToEnrollmentResponse(enrollment);
    }

    @Override
    @Transactional
    public void updateProgress(Long enrollmentId, Float progress) {
        UserEntity user = userService.getCurrentUser();

        EnrollmentEntity enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENROLLMENT_NOT_FOUND.getMessage()));

        if (!enrollment.getUser().getUserId().equals(user.getUserId())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN.getMessage());
        }

        if (progress < 0 || progress > 100) {
            throw new BadRequestException("Progress phải trong khoảng 0-100");
        }

        enrollment.setProgress(progress);
        enrollmentRepository.save(enrollment);
    }

    @Override
    public boolean isEnrolled(Long courseId) {
        UserEntity user = userService.getCurrentUser();

        CourseEntity course = courseService.getCourseEntityById(courseId);

        return enrollmentRepository.existsByUserAndCourse(user, course);
    }

    @Override
    @Transactional
    public void createEnrollment(UserEntity user, CourseEntity course) {
        if (!enrollmentRepository.existsByUserAndCourse(user, course)) {
            EnrollmentEntity enrollment = EnrollmentEntity.builder()
                    .user(user)
                    .course(course)
                    .enrolledAt(java.time.LocalDateTime.now())
                    .progress(0f)
                    .build();
            enrollmentRepository.save(enrollment);
        }
    }


    @Override
    @Transactional(readOnly = true)
    public boolean existsByUserAndCourse(UserEntity user, CourseEntity course) {
        return enrollmentRepository.existsByUserAndCourse(user, course);
    }

    private EnrollmentResponse mapToEnrollmentResponse(EnrollmentEntity enrollment) {
        return enrollmentMapper.toResponse(enrollment);
    }
}
