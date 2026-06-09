package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String roleName;
    private java.util.Set<String> directPermissions;
    private java.util.Set<String> inheritedPermissions;
    private java.util.Set<String> effectivePermissions;

    public LoginResponse(String token, String type, Long userId, String username, String email, String roleName) {
        this.token = token;
        this.type = type;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.roleName = roleName;
        this.directPermissions = java.util.Set.of();
        this.inheritedPermissions = java.util.Set.of();
        this.effectivePermissions = java.util.Set.of();
    }
}
