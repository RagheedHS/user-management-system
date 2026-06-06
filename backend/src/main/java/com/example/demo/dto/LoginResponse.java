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
}
