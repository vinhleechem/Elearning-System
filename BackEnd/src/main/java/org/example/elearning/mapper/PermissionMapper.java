package org.example.elearning.mapper;


import org.example.elearning.dto.request.PermissionRequest;
import org.example.elearning.dto.response.PermissionResponse;
import org.example.elearning.entity.PermissionEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    PermissionEntity toPermission(PermissionRequest permissionRequest);
    PermissionResponse toPermissionResponse(PermissionEntity permission);
    @BeanMapping(nullValuePropertyMappingStrategy =  NullValuePropertyMappingStrategy.IGNORE)
    void updatePermission(PermissionRequest permissionRequest, @MappingTarget PermissionEntity permissionEntity);
}
