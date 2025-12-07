package org.example.elearning.mapper;

import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.UserEntity;
import org.mapstruct.*;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updated_At", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "roles", ignore = true)
    UserEntity toEntity(UserCreateRequest userRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updated_At", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "providerId", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    void updateEntity(@MappingTarget UserEntity userEntity, UserUpdateRequest userRequest);

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
