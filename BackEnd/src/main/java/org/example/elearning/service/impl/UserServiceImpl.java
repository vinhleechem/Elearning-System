package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.constant.PredefinedRole;
import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.UserStatus;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ForbiddenException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.exception.exceptions.UnauthorizedException;
import org.example.elearning.mapper.UserMapper;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    UserMapper userMapper;
    UserRepository userRepository;

    @Override
    public UserDetailsService userDetailsService() {
        return email -> userRepository.findByEmail(email).orElseThrow(() ->
                                        new UsernameNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
    }
    @Override
    public UserResponse getMyInfo() {
        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity userEntity = getUserByEmail(name);
        return userMapper.toEntityDTO(userEntity);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<UserEntity> userEntities = userRepository.findAll().stream().filter(userEntity -> !userEntity.isDeleted()).toList();
        return userMapper.toEntityDTO(userEntities);
    }



    @Override
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
    }
    @Override
    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
    }
    @Override
    public UserEntity getActiveUser(String email){
        UserEntity userEntity = userRepository.findByEmail(email).orElseThrow(() ->
                new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS.getMessage()));
        if(!userEntity.getStatus().equals(UserStatus.ACTIVE)){
            throw new ForbiddenException(ErrorCode.USER_LOCKED.getMessage());
        }
        if (userEntity.isDeleted()) {
            throw new ResourceNotFoundException(ErrorCode.USER_DELETED.getMessage());
        }
        return userEntity;
    }

    @Override
    public UserResponse createUser(UserCreateRequest userRequest) {
        UserEntity userEntity = getUserByEmail(userRequest.getEmail());
        if(userEntity != null){
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS.getMessage());
        }
        UserEntity newUser = userMapper.toEntity(userRequest);
        return userMapper.toEntityDTO(userRepository.save(newUser));
    }

    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest userUpdateRequest) {
        UserEntity userEntity = getUserById(id);
        userMapper.updateEntity(userEntity, userUpdateRequest);
        return userMapper.toEntityDTO(userRepository.save(userEntity));
    }

    @Override
    public void deleteUser(Long id) {
        UserEntity user = getUserById(id);
        user.getRoles().forEach(this::handleAdminUser);
        user.setStatus(UserStatus.LOCKED);
        user.setDeleted(true);
        userRepository.save(user);
    }
    @Override
    public void restoreUser(Long id) {
        UserEntity entity = getUserById(id);
        entity.setDeleted(false);
        userRepository.save(entity);
    }

    private void handleAdminUser(RoleEntity entity) {
        if (PredefinedRole.ROLE_ADMIN.equals(entity.getRoleName())) {
            throw new BusinessException("Tài khoản ADMIN không được tùy chỉnh!");
        }
    }
}
