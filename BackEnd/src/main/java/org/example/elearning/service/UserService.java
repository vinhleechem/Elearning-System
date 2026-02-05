package org.example.elearning.service;

import java.io.IOException;
import java.util.List;

import org.example.elearning.dto.request.ChangePasswordRequest;
import org.example.elearning.dto.request.UpdateProfileRequest;
import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.UserStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    // ========================================
    // INTERNAL/HELPER METHODS
    // ========================================

    UserEntity getUserByIdEntity(Long id);

    
    UserEntity getUserByEmail(String email);

    
    UserEntity getActiveUser(String email);

   
    UserEntity getCurrentUser();

    // ========================================
    // USER SELF-SERVICE OPERATIONS
    // Methods that users call for themselves
    // ========================================
    
    UserResponse getMyProfile();

    
    UserResponse updateMyProfile(UpdateProfileRequest request);

   
    void changeMyPassword(ChangePasswordRequest request);

    
    UserResponse uploadMyAvatar(MultipartFile file);

    
    void deleteMyAvatar();

    // ========================================
    // ADMIN OPERATIONS - USER MANAGEMENT
    // Methods that only admins can call
    // ========================================
    
    
    UserResponse createUser(UserCreateRequest request);

    
    UserResponse updateUserById(Long userId, UserUpdateRequest request);

    
    UserResponse getUserById(Long userId);

    
    PaginatedResponse<UserResponse> getAllUsers(Pageable pageable, String search, UserStatus userStatus, Boolean deleted);

    
    void deleteUser(Long userId);

   
    void restoreUser(Long userId);

    
    UserResponse toggleUserStatus(Long userId);

    
    UserResponse assignRolesToUser(Long userId, List<String> roleNames);

    String resetUserPassword(Long userId);

    
    UserResponse uploadAvatarForUser(Long userId, MultipartFile file);

    // ========================================
    // ADMIN OPERATIONS - BULK/SYSTEM
    // ========================================
    
    byte[] exportUsersToExcel() throws IOException;

    void importUsersFromExcel(MultipartFile file) throws IOException;

    List<UserEntity> findAllAdmins();
}
