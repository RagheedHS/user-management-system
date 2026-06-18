package com.example.usermanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String password;
    
    private String status; // "Active", "Inactive", "Pending"
    private String avatar;
    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Constructors
    public User() {
        this.createdAt = LocalDateTime.now();
    }

    public User(String name, String email, String password, String status, String avatar) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.status = status;
        this.avatar = avatar;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    // Convenience property for serialization/deserialization to work with the legacy React code.
    // Automatically maps the first role name to the "role" property.
    public String getRole() {
        if (roles != null && !roles.isEmpty()) {
            // Return first role name (without ROLE_ prefix if needed, or with it).
            // Let's clean the ROLE_ prefix so the UI displays it cleanly as "Admin", "Editor", "Viewer".
            String roleName = roles.iterator().next().getName();
            if (roleName.startsWith("ROLE_")) {
                return roleName.substring(5);
            }
            return roleName;
        }
        return "Viewer";
    }

    public void setRole(String roleName) {
        // This setter helps when receiving simple role updates from the UI
        // We will resolve actual role updates in the service layer, but we define the setter so spring binding works
    }
}
