package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.UpdateInstructorProfileRequest;
import org.example.elearning.dto.response.InstructorResponse;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.InstructorMapper;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.InstructorService;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Primary
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class InstructorServiceImpl implements InstructorService {
    InstructorRepository instructorRepository;
    UserRepository userRepository;
    InstructorMapper instructorMapper;

    @Override
    public InstructorResponse getInstructorById(Long instructorId) {
        InstructorEntity instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));

        return instructorMapper.toResponse(instructor);
    }

    @Override
    public InstructorResponse getMyInstructorProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        InstructorEntity instructor = instructorRepository.findByUser(user)
                .orElseGet(() -> createDefaultInstructorProfile(user));

        return instructorMapper.toResponse(instructor);
    }

    @Override
    @Transactional
    public InstructorResponse updateMyInstructorProfile(UpdateInstructorProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        InstructorEntity instructor = instructorRepository.findByUser(user)
                .orElseGet(() -> createDefaultInstructorProfile(user));

        instructorMapper.updateEntity(instructor, request);

        instructor = instructorRepository.save(instructor);

        return instructorMapper.toResponse(instructor);
    }

    @Override
    @Transactional
    public InstructorResponse becomeInstructor() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        // Kiểm tra đã là instructor chưa
        if (instructorRepository.existsByUser(user)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_OPERATION.getMessage());
        }

        InstructorEntity instructor = createDefaultInstructorProfile(user);

        return instructorMapper.toResponse(instructor);
    }

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
    }

    private InstructorEntity createDefaultInstructorProfile(UserEntity user) {
        InstructorEntity newInstructor = InstructorEntity.builder()
                .user(user)
                .totalStudents(0)
                .totalCourses(0)
                .build();
        return instructorRepository.save(newInstructor);
    }
}

