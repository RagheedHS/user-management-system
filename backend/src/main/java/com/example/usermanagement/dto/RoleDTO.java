package com.example.usermanagement.dto;

import com.example.usermanagement.model.Role;
import java.util.Set;
import java.util.stream.Collectors;

public class RoleDTO {
    private Long id;
    private String name;
    private String description;
    private Set<String> permissions;

    public RoleDTO() {}

    public RoleDTO(Role role) {
        this.id = role.getId();
        this.name = role.getName();
        this.description = role.getDescription();
        this.permissions = role.getPermissions()
                .stream()
                .map(p -> p.getName())
                .collect(Collectors.toSet());
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Set<String> getPermissions() { return permissions; }
    public void setPermissions(Set<String> permissions) { this.permissions = permissions; }
}
