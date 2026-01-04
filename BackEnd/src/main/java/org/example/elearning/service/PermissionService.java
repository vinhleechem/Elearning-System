package org.example.elearning.service;

import org.example.elearning.dto.request.PermissionRequest;
import org.example.elearning.dto.response.PermissionResponse;
import org.example.elearning.entity.PermissionEntity;

import java.util.List;

public interface PermissionService {
    List<PermissionResponse> getAllPermissions();
    PermissionResponse getPermissionById(Long id);
    PermissionResponse add(PermissionRequest permissionRequest);
    PermissionResponse update(Long id,PermissionRequest permissionRequest);
    void softDelete(Long id);
    PermissionEntity findEntityById(Long id);
    void restore(Long id);
    
    // For internal service usage
    List<PermissionEntity> findAllById(Iterable<Long> ids);
}
