package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.EnrollmentResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.EnrollmentEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.EnrollmentService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {
    EnrollmentRepository enrollmentRepository;
    UserRepository userRepository;
    CourseRepository courseRepository;

    @Override
    public List<EnrollmentResponse> getMyEnrollments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        List<EnrollmentEntity> enrollments = enrollmentRepository.findByUser(user);

        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EnrollmentResponse getEnrollmentDetail(Long enrollmentId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        EnrollmentEntity enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));

        if (!enrollment.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_OPERATION.getMessage());
        }

        return mapToEnrollmentResponse(enrollment);
    }

    @Override
    @Transactional
    public void updateProgress(Long enrollmentId, Float progress) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        EnrollmentEntity enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));

        if (!enrollment.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_OPERATION.getMessage());
        }

        if (progress < 0 || progress > 100) {
            throw new BusinessException("Progress phải trong khoảng 0-100");
        }

        enrollment.setProgress(progress);
        enrollmentRepository.save(enrollment);
    }

    @Override
    public boolean isEnrolled(Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.COURSE_NOT_FOUND.getMessage()));

        return enrollmentRepository.existsByUserAndCourse(user, course);
    }

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
    }

    private EnrollmentResponse mapToEnrollmentResponse(EnrollmentEntity enrollment) {
        CourseEntity course = enrollment.getCourse();
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .courseId(course.getCourseId())
                .courseTitle(course.getTitle())
                .courseImage(course.getThumbnailUrl())
                .instructorName(course.getInstructor() != null && course.getInstructor().getUser() != null
                        ? course.getInstructor().getUser().getFullName()
                        : null)
                .progress(enrollment.getProgress())
                .enrolledAt(enrollment.getEnrolledAt())
                .totalLessons(0) // TODO: Calculate from course sections
                .completedLessons(0) // TODO: Calculate from user progress
                .build();
    }
}
