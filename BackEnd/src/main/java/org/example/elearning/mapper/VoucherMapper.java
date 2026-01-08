package org.example.elearning.mapper;

import org.example.elearning.dto.request.VoucherRequest;
import org.example.elearning.dto.response.VoucherResponse;
import org.example.elearning.entity.VoucherEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VoucherMapper {

    @Mapping(target = "applicableCourseIds", expression = "java(entity.getApplicableCourses() != null ? entity.getApplicableCourses().stream().map(c -> c.getCourseId()).collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())")
    VoucherResponse toResponse(VoucherEntity entity);

    List<VoucherResponse> toResponseList(List<VoucherEntity> entities);

    @Mapping(target = "voucherId", ignore = true)
    @Mapping(target = "instructor", ignore = true)
    @Mapping(target = "applicableCourses", ignore = true)
    VoucherEntity toEntity(VoucherRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "voucherId", ignore = true)
    @Mapping(target = "instructor", ignore = true)
    @Mapping(target = "applicableCourses", ignore = true)
    void updateEntity(@MappingTarget VoucherEntity entity, VoucherRequest request);
}
