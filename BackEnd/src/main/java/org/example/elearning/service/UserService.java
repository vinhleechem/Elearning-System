package org.example.elearning.service;

import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.UserEntity;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService {
    UserDetailsService userDetailsService();

    UserEntity getUserById(Long id);

    UserEntity getUserByEmail(String email);

    UserEntity getActiveUser(String email);

    UserResponse createUser(UserCreateRequest userRequest);

    UserResponse updateUser(Long id, UserUpdateRequest userRequest);

    List<UserResponse> getAllUsers();

    UserResponse getMyInfo();

    void restoreUser(Long id);

    void deleteUser(Long id);
}
