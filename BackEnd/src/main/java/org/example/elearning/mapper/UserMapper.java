package org.example.elearning.mapper;

import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UpdateProfileRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.entity.UserEntity;
import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserEntity toEntity(UserCreateRequest userRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget UserEntity userEntity, UserUpdateRequest userRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget UserEntity userEntity, UpdateProfileRequest updateProfileRequest);

    UserResponse toEntityDTO(UserEntity userEntity);

    List<UserResponse> toEntityDTO(List<UserEntity> userEntities);

    default String map(RoleEntity role) {
        return role != null ? role.getRoleName() : null;
    }
}


