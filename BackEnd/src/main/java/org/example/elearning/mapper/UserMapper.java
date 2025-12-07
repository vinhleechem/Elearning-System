package org.example.elearning.mapper;

import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UpdateProfileRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.UserEntity;
import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    UserEntity toEntity(UserCreateRequest userRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget UserEntity userEntity, UserUpdateRequest userRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget UserEntity userEntity, UpdateProfileRequest updateProfileRequest);

    @Mapping(target = "updatedAt", source = "updated_At")
    @Mapping(target = "roles", expression = "java(mapRoles(userEntity))")
    UserResponse toEntityDTO(UserEntity userEntity);

    List<UserResponse> toEntityDTO(List<UserEntity> userEntities);


    default java.util.List<String> mapRoles(UserEntity userEntity) {
        if (userEntity.getRoles() == null) {
            return java.util.Collections.emptyList();
        }
        return userEntity.getRoles()
                .stream()
                .map(role -> role.getRoleName())
                .toList();
    }
}
