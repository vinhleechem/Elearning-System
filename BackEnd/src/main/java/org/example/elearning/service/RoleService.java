package org.example.elearning.service;


import org.example.elearning.dto.request.RoleRequest;
import org.example.elearning.dto.response.RoleResponse;
import org.example.elearning.entity.RoleEntity;

import java.util.List;
import java.util.Optional;

public interface RoleService {
    List<RoleResponse> getAllRoles();
    RoleResponse add(RoleRequest roleRequest);
    RoleResponse update(Long id,RoleRequest roleRequest);
    void update(Long roleID, Long permissionID);
    RoleEntity findByIdToEntity(Long id);
    RoleEntity findByRoleName(String roleName);
    
    // For internal service usage
    Optional<RoleEntity> findByRoleNameOptional(String roleName);
}
