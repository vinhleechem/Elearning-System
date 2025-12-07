package org.example.elearning.service;

import org.example.elearning.dto.request.UpdateInstructorProfileRequest;
import org.example.elearning.dto.response.InstructorResponse;

public interface InstructorService {
    InstructorResponse getInstructorById(Long instructorId);
    InstructorResponse getMyInstructorProfile();
    InstructorResponse updateMyInstructorProfile(UpdateInstructorProfileRequest request);
    InstructorResponse becomeInstructor();
}

