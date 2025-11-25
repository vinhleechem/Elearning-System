package org.example.elearning.dto.response;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
    Long roleId;
    String roleName;
    Set<PermissionResponse> permissions;
}
