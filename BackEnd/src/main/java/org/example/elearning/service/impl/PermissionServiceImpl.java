package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.constant.PredefinedRole;
import org.example.elearning.dto.request.PermissionRequest;
import org.example.elearning.dto.response.PermissionResponse;
import org.example.elearning.entity.PermissionEntity;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.PermissionMapper;
import org.example.elearning.repository.PermissionRepository;
import org.example.elearning.service.PermissionService;
import org.example.elearning.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl implements PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;
    RoleService roleService;

    @Override
    public List<PermissionResponse> getAllPermissions() {
        List<PermissionEntity> permissions = permissionRepository.findAllByOrderByPermissionIdAsc();
        if(permissions.isEmpty()){
            throw new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage());
        }
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    @Override
    public PermissionResponse getPermissionById(Long id) {
        return permissionMapper.toPermissionResponse(findEntityById(id));
    }

    @Override
    public PermissionResponse add(PermissionRequest permissionRequest) {
        if(permissionRepository.existsByPermissionName(permissionRequest.getPermissionName())){
            throw new ResourceNotFoundException(ErrorCode.PERMISSION_EXISTED.getMessage());
        }

        PermissionEntity permission = permissionMapper.toPermission(permissionRequest);
        permissionRepository.save(permission);
        log.info("Permission created, updating admin role");
        
        // Update admin role to include this permission by calling update method
        RoleEntity adminRole = roleService.findByRoleNameOptional(PredefinedRole.ROLE_ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ROLE_NOT_FOUND.getMessage()));
        adminRole.getPermissions().add(permission);
        permissionRepository.save(permission); // Save permission with updated relationship
        
        return permissionMapper.toPermissionResponse(permission);
    }

    @Override
    public PermissionResponse update(Long id,PermissionRequest permissionRequest) {
        PermissionEntity permission = findEntityById(id);
        permissionMapper.updatePermission(permissionRequest, permission);
        return permissionMapper.toPermissionResponse(permissionRepository.save(permission));
    }

    @Override
    public void softDelete(Long id) {
        PermissionEntity permission = findEntityById(id);
        permission.setDeleted(true);
        permissionRepository.save(permission);
    }

    @Override
    public PermissionEntity findEntityById(Long id) {
        return  permissionRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
    }

    @Override
    public void restore(Long id) {
        PermissionEntity entity = findEntityById(id);
        entity.setDeleted(false);
        permissionRepository.save(entity);
    }

    @Override
    public List<PermissionEntity> findAllById(Iterable<Long> ids) {
        return permissionRepository.findAllById(ids);
    }
}
