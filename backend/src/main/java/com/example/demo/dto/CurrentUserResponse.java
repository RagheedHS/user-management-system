package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserResponse {
    private Long userId;
    private String username;
    private String email;
    private String roleName;
    private Set<String> directPermissions;
    private Set<String> inheritedPermissions;
    private Set<String> effectivePermissions;
}
