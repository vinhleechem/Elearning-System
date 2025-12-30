package org.example.elearning.mapper;

import org.example.elearning.dto.request.UpdateInstructorProfileRequest;
import org.example.elearning.dto.response.InstructorResponse;
import org.example.elearning.entity.InstructorEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InstructorMapper {

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    InstructorResponse toResponse(InstructorEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget InstructorEntity entity, UpdateInstructorProfileRequest request);
}
