package com.example.demo.config;

import com.example.demo.entity.Permission;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class SeedDataLoader implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() > 0) {
            return; // Data already exists
        }

        // Create Permissions
        Permission createUser = createPermissionIfNotExists("CREATE_USER", "Create new users", "User Management");
        Permission readUser = createPermissionIfNotExists("READ_USER", "Read user information", "User Management");
        Permission updateUser = createPermissionIfNotExists("UPDATE_USER", "Update user information", "User Management");
        Permission deleteUser = createPermissionIfNotExists("DELETE_USER", "Delete users", "User Management");

        Permission createRole = createPermissionIfNotExists("CREATE_ROLE", "Create new roles", "Role Management");
        Permission readRole = createPermissionIfNotExists("READ_ROLE", "Read role information", "Role Management");
        Permission updateRole = createPermissionIfNotExists("UPDATE_ROLE", "Update role information", "Role Management");
        Permission deleteRole = createPermissionIfNotExists("DELETE_ROLE", "Delete roles", "Role Management");

        Permission createPermission = createPermissionIfNotExists("CREATE_PERMISSION", "Create new permissions", "Permission Management");
        Permission readPermission = createPermissionIfNotExists("READ_PERMISSION", "Read permission information", "Permission Management");
        Permission updatePermission = createPermissionIfNotExists("UPDATE_PERMISSION", "Update permission information", "Permission Management");
        Permission deletePermission = createPermissionIfNotExists("DELETE_PERMISSION", "Delete permissions", "Permission Management");

        Permission viewDashboard = createPermissionIfNotExists("VIEW_DASHBOARD", "View admin dashboard", "Dashboard");
        Permission viewReports = createPermissionIfNotExists("VIEW_REPORTS", "View reports", "Dashboard");

        // Create Roles with permissions
        Set<Permission> adminPermissions = new HashSet<>();
        adminPermissions.add(createUser);
        adminPermissions.add(readUser);
        adminPermissions.add(updateUser);
        adminPermissions.add(deleteUser);
        adminPermissions.add(createRole);
        adminPermissions.add(readRole);
        adminPermissions.add(updateRole);
        adminPermissions.add(deleteRole);
        adminPermissions.add(createPermission);
        adminPermissions.add(readPermission);
        adminPermissions.add(updatePermission);
        adminPermissions.add(deletePermission);
        adminPermissions.add(viewDashboard);
        adminPermissions.add(viewReports);

        Role adminRole = createRoleIfNotExists("ADMIN", "Administrator", 100, adminPermissions);

        Set<Permission> managerPermissions = new HashSet<>();
        managerPermissions.add(readUser);
        managerPermissions.add(updateUser);
        managerPermissions.add(createRole);
        managerPermissions.add(readRole);
        managerPermissions.add(updateRole);
        managerPermissions.add(readPermission);
        managerPermissions.add(viewDashboard);
        managerPermissions.add(viewReports);

        Role managerRole = createRoleIfNotExists("MANAGER", "Manager", 50, managerPermissions);

        Set<Permission> userPermissions = new HashSet<>();
        userPermissions.add(readUser);
        userPermissions.add(viewDashboard);

        Role userRole = createRoleIfNotExists("USER", "Regular User", 10, userPermissions);

        // Create Users
        createUserIfNotExists("admin", "admin@example.com", "password123", "Admin", "User", adminRole);
        createUserIfNotExists("manager", "manager@example.com", "password123", "Manager", "User", managerRole);
        createUserIfNotExists("user1", "user1@example.com", "password123", "John", "Doe", userRole);
        createUserIfNotExists("user2", "user2@example.com", "password123", "Jane", "Smith", userRole);
    }

    private Permission createPermissionIfNotExists(String name, String description, String category) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> {
                    Permission permission = new Permission();
                    permission.setName(name);
                    permission.setDescription(description);
                    permission.setCategory(category);
                    permission.setActive(true);
                    return permissionRepository.save(permission);
                });
    }

    private Role createRoleIfNotExists(String name, String description, Integer roleLevel, Set<Permission> permissions) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(name);
                    role.setDescription(description);
                    role.setRoleLevel(roleLevel);
                    role.setActive(true);
                    role.setPermissions(permissions);
                    return roleRepository.save(role);
                });
    }

    private void createUserIfNotExists(String username, String email, String password, String firstName, String lastName, Role role) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setActive(true);
            user.setRole(role);
            userRepository.save(user);
        }
    }
}
