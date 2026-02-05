package org.example.elearning.mapper;


import org.example.elearning.dto.request.PermissionRequest;
import org.example.elearning.dto.response.PermissionResponse;
import org.example.elearning.entity.PermissionEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    @Mapping(target = "permissionId", ignore = true)
    PermissionEntity toPermission(PermissionRequest permissionRequest);

    PermissionResponse toPermissionResponse(PermissionEntity permission);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "permissionId", ignore = true)
    void updatePermission(PermissionRequest permissionRequest, @MappingTarget PermissionEntity permissionEntity);
}
