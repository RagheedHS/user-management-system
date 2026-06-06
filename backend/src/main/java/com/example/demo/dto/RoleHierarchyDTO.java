package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleHierarchyDTO {
    private Long id;
    private String name;
    private String description;
    private Integer roleLevel;
    private Boolean active;
    private Long parentRoleId;
    private String parentRoleName;
    private Set<Long> directPermissionIds;
    private Set<Long> inheritedPermissionIds;
    private Set<Long> effectivePermissionIds;
    private List<RoleHierarchyDTO> children;
}
