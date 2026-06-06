package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private Long id;
    private String name;
    private String description;
    private Integer roleLevel;
    private Boolean active;
    private Long parentRoleId;
    private Set<Long> permissionIds;
    private String parentRoleName;
    private Set<Long> inheritedPermissionIds;
    private Set<Long> effectivePermissionIds;
    private Set<String> effectivePermissionNames;
}
