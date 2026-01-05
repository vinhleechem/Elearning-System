package org.example.elearning.service;

import java.util.List;

import org.example.elearning.dto.request.ChangePasswordRequest;
import org.example.elearning.dto.request.UpdateProfileRequest;
import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.UserEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    UserEntity getUserByIdEntity(Long id);

    UserEntity getUserByEmail(String email);

    UserEntity getActiveUser(String email);

    UserEntity getCurrentUser();

    // Admin APIs
    UserResponse createUser(UserCreateRequest userRequest);

    UserResponse updateUser(Long id, UserUpdateRequest userRequest);

    PaginatedResponse<UserResponse> getAllUsers(Pageable pageable, String search);

    UserResponse getUserById(Long id);

    void deleteUser(Long id);

    void restoreUser(Long id);

    UserResponse toggleUserStatus(Long id);

    UserResponse assignRoles(Long id, List<String> roleNames);

    String resetPassword(Long id);
    
    // For internal service usage
    List<UserEntity> findAllAdmins();

    // User self-service APIs
    UserResponse getMyInfo();

    UserResponse updateMyProfile(UpdateProfileRequest request);

    void changePassword(ChangePasswordRequest request);

    UserResponse uploadAvatar(MultipartFile file);

    void deleteAvatar();

    // Admin update avatar for specific user
    // Admin update avatar for specific user
    UserResponse updateUserAvatar(Long id, MultipartFile file);

    void importUsers(MultipartFile file) throws java.io.IOException;
}
