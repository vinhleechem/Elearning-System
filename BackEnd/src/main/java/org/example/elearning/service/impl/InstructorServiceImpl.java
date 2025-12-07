package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.UpdateInstructorProfileRequest;
import org.example.elearning.dto.response.InstructorResponse;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.InstructorService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class InstructorServiceImpl implements InstructorService {
    InstructorRepository instructorRepository;
    UserRepository userRepository;

    @Override
    public InstructorResponse getInstructorById(Long instructorId) {
        InstructorEntity instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        return mapToInstructorResponse(instructor);
    }

    @Override
    public InstructorResponse getMyInstructorProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        InstructorEntity instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException("Bạn chưa đăng ký làm giảng viên"));

        return mapToInstructorResponse(instructor);
    }

    @Override
    @Transactional
    public InstructorResponse updateMyInstructorProfile(UpdateInstructorProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        InstructorEntity instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException("Bạn chưa đăng ký làm giảng viên"));

        if (request.getHeadline() != null) {
            instructor.setHeadline(request.getHeadline());
        }
        if (request.getBiography() != null) {
            instructor.setBiography(request.getBiography());
        }
        if (request.getWebsite() != null) {
            instructor.setWebsite(request.getWebsite());
        }
        if (request.getLinkedin() != null) {
            instructor.setLinkedin(request.getLinkedin());
        }
        if (request.getTwitter() != null) {
            instructor.setTwitter(request.getTwitter());
        }
        if (request.getYoutube() != null) {
            instructor.setYoutube(request.getYoutube());
        }

        instructor = instructorRepository.save(instructor);

        return mapToInstructorResponse(instructor);
    }

    @Override
    @Transactional
    public InstructorResponse becomeInstructor() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        // Kiểm tra đã là instructor chưa
        if (instructorRepository.existsByUser(user)) {
            throw new BusinessException("Bạn đã là giảng viên rồi");
        }

        InstructorEntity instructor = InstructorEntity.builder()
                .user(user)
                .totalStudents(0)
                .totalCourses(0)
                .build();

        instructor = instructorRepository.save(instructor);

        return mapToInstructorResponse(instructor);
    }

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    private InstructorResponse mapToInstructorResponse(InstructorEntity instructor) {
        UserEntity user = instructor.getUser();
        return InstructorResponse.builder()
                .instructorId(instructor.getInstructorId())
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .headline(instructor.getHeadline())
                .biography(instructor.getBiography())
                .website(instructor.getWebsite())
                .linkedin(instructor.getLinkedin())
                .twitter(instructor.getTwitter())
                .youtube(instructor.getYoutube())
                .totalStudents(instructor.getTotalStudents())
                .totalCourses(instructor.getTotalCourses())
                .build();
    }
}

