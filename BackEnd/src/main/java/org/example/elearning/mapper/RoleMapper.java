package org.example.elearning.mapper;


import org.example.elearning.dto.request.RoleRequest;
import org.example.elearning.dto.response.RoleResponse;
import org.example.elearning.entity.RoleEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    RoleEntity toRole(RoleRequest roleRequest);
    RoleResponse toRoleResponse(RoleEntity role);
    @Mapping(target = "permissions", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE )
    void updateRole(RoleRequest roleRequest, @MappingTarget RoleEntity role);
}
