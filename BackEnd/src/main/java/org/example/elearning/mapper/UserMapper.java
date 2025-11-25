package org.example.elearning.mapper;

import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.UserEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserEntity toEntity(UserCreateRequest userRequest);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget UserEntity userEntity, UserUpdateRequest userRequest);

    UserResponse toEntityDTO(UserEntity userEntity);

    List<UserResponse> toEntityDTO(List<UserEntity> userEntities);

//    List<UserResponse.UserEmployeePaginationResponse> toEmployeePaginationResponse(List<UserEntity> accountEntities);
//
//    List<UserResponse.UserCustomerPaginationResponse> toCustomerPaginationResponse(List<UserEntity> accountEntities);


//    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
//    @Mapping(target = "roles", ignore = true)
//    void updateEntity(@MappingTarget UserEntity accountEntity, UserUpdateEmployeeRequest accountUpdateProfileRequest);
//
//    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
//    void updateEntity(@MappingTarget UserEntity accountEntity, UserUpdateMemberRequest accountUpdateProfileRequest);

//    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
//    @Mapping(target = "email", source = "newEmail")
//    @Mapping(target = "phoneNumber", source = "newPhoneNumber")
//    @Mapping(target = "identityCard", source = "identityCard")
//    @Mapping(target = "dateOfBirth", source = "dateOfBirth")
//    @Mapping(target = "password", ignore = true) // Xử lý ngoài service
//    void updateEntity(@MappingTarget UserEntity entity, UserUpdateProfileRequest request);

//    @Mapping(target = "userId", source = "userId")
//    UserUpdateProfileResponse toUpdateProfileResponse(UserEntity entity);

}
