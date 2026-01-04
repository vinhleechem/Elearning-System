package org.example.elearning.service;

import org.example.elearning.dto.request.UpdateInstructorProfileRequest;
import org.example.elearning.dto.response.InstructorResponse;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.UserEntity;

import java.util.Optional;

public interface InstructorService {
    InstructorResponse getInstructorById(Long instructorId);
    InstructorResponse getMyInstructorProfile();
    InstructorResponse updateMyInstructorProfile(UpdateInstructorProfileRequest request);
    InstructorResponse becomeInstructor();
    
    // For internal service usage - returns entity instead of DTO
    InstructorEntity getInstructorEntityById(Long instructorId);
    Optional<InstructorEntity> findInstructorByUser(UserEntity user);
}

