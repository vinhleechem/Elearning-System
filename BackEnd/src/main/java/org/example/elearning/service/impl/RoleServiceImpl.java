package org.example.elearning.service.impl;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.constant.PredefinedRole;
import org.example.elearning.dto.request.RoleRequest;
import org.example.elearning.dto.response.RoleResponse;
import org.example.elearning.entity.PermissionEntity;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceConflictException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.RoleMapper;
import org.example.elearning.repository.RoleRepository;
import org.example.elearning.service.PermissionService;
import org.example.elearning.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static org.example.elearning.exception.ErrorCode.ROLE_NOT_FOUND;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;
    PermissionService permissionService;

    @Override
    public List<RoleResponse> getAllRoles() {
        List<RoleEntity> roles = roleRepository.findAll();
        if (roles.isEmpty()) {
            throw new ResourceNotFoundException(ROLE_NOT_FOUND.getMessage());
        }
        return roles.stream().map(roleMapper::toRoleResponse).toList();
    }

    @Override
    public RoleResponse add(RoleRequest roleRequest) {
        String roleName = roleRequest.getRoleName().toUpperCase(Locale.ROOT);
        RoleEntity role = roleRepository.findByRoleNameAndIsDeletedFalse(roleName)
                .orElseGet(() -> {
                    RoleEntity newRole = roleMapper.toRole(roleRequest);
                    newRole.setRoleName(roleName);
                    newRole.setDeleted(false);
                    newRole.setPermissions(new HashSet<>()); // Khởi tạo Set rỗng cho vai trò mới
                    return newRole;
                });
        var permissions = permissionService.findAllById(roleRequest.getPermissions());
        if (permissions.size() != roleRequest.getPermissions().size()) {
            throw new IllegalArgumentException(ErrorCode.PERMISSION_NOT_FOUND.getMessage());
        }
        role.getPermissions().addAll(permissions);
        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    @Override
    public RoleResponse update(Long id, RoleRequest roleRequest) {
        RoleEntity roleEntity = findByIdToEntity(id);
        if (roleRepository.findByRoleNameAndIsDeletedFalse(roleRequest.getRoleName()).isPresent()) {
            throw new ResourceConflictException(ErrorCode.ROLE_EXISTED.getMessage());
        }
        if (roleRequest.getPermissions() != null) {
            var permissions = permissionService.findAllById(roleRequest.getPermissions());
            if (permissions.size() != roleRequest.getPermissions().size()) {
                throw new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage());
            }
            roleEntity.setPermissions(new HashSet<>(permissions));
        }
        roleMapper.updateRole(roleRequest,roleEntity);
        return roleMapper.toRoleResponse(roleRepository.save(roleEntity));
    }

    @Override
    public void update(Long roleID, Long permissionID) {
        PermissionEntity permission = permissionService.findEntityById(permissionID);
        RoleEntity role = findByIdToEntity(roleID);

        if(role.getPermissions().contains(permission)) {
            role.getPermissions().remove(permission);
        } else {
            role.getPermissions().add(permission);
        }

        roleRepository.save(role);
    }

    @Override
    public RoleEntity findByIdToEntity(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND.getMessage()));
    }

    @Override
    public RoleEntity findByRoleName(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND.getMessage()));
    }

    @Override
    public Optional<RoleEntity> findByRoleNameOptional(String roleName) {
        return roleRepository.findByRoleNameAndIsDeletedFalse(roleName);
    }



}
