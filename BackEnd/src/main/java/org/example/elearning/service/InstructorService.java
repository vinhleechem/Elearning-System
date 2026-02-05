package org.example.elearning.service;

import org.example.elearning.dto.request.UpdateInstructorProfileRequest;
import org.example.elearning.dto.response.InstructorResponse;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.UserEntity;

import java.util.Optional;

public interface InstructorService {
    InstructorEntity getMyInfo();

    InstructorEntity getInstructorEntityById(Long instructorId);

    InstructorResponse getInstructorById(Long instructorId);

    InstructorResponse getMyInstructorProfile();

    InstructorResponse updateMyInstructorProfile(UpdateInstructorProfileRequest request);

    InstructorResponse updateInstructorByUserId(Long userId, UpdateInstructorProfileRequest request);

    InstructorResponse becomeInstructor();

    Optional<InstructorEntity> findInstructorByUser(UserEntity user);
}

