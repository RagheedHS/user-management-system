package com.example.demo.controller;

import com.example.demo.dto.RoleDTO;
import com.example.demo.dto.CreateRoleRequest;
import com.example.demo.dto.RoleHierarchyDTO;
import com.example.demo.dto.UpdateRoleRequest;
import com.example.demo.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<RoleDTO> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchRoles(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "roleLevel") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        return ResponseEntity.ok(roleService.getRoles(search, active, page, size, sortBy, sortDir));
    }

    @GetMapping("/active")
    public ResponseEntity<List<RoleDTO>> getActiveRoles() {
        List<RoleDTO> roles = roleService.getActiveRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        RoleDTO role = roleService.getRoleById(id);
        return ResponseEntity.ok(role);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> createRole(@Valid @RequestBody CreateRoleRequest roleRequest,
                                              Principal principal) {
        RoleDTO createdRole = roleService.createRole(roleRequest, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> updateRole(@PathVariable Long id,
                                              @Valid @RequestBody UpdateRoleRequest roleRequest,
                                              Principal principal) {
        RoleDTO updatedRole = roleService.updateRole(id, roleRequest, principal.getName());
        return ResponseEntity.ok(updatedRole);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id, Principal principal) {
        roleService.deleteRole(id, principal != null ? principal.getName() : "SYSTEM");
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<RoleDTO> addPermissionToRole(@PathVariable Long roleId,
                                                       @PathVariable Long permissionId,
                                                       Principal principal) {
        RoleDTO role = roleService.addPermissionToRole(roleId, permissionId,
            principal != null ? principal.getName() : "SYSTEM");
        return ResponseEntity.ok(role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<RoleDTO> removePermissionFromRole(@PathVariable Long roleId,
                                                            @PathVariable Long permissionId,
                                                            Principal principal) {
        RoleDTO role = roleService.removePermissionFromRole(roleId, permissionId,
            principal != null ? principal.getName() : "SYSTEM");
        return ResponseEntity.ok(role);
    }

    @GetMapping("/hierarchy")
    public ResponseEntity<List<RoleHierarchyDTO>> getRoleHierarchy() {
        return ResponseEntity.ok(roleService.getHierarchy());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/parent")
    public ResponseEntity<RoleDTO> updateParentRole(@PathVariable Long id,
                                                    @RequestParam(required = false) Long parentRoleId,
                                                    Principal principal) {
        return ResponseEntity.ok(roleService.updateParent(id, parentRoleId, principal.getName()));
    }

    @GetMapping("/{id}/effective-permissions")
    public ResponseEntity<List<Long>> getEffectivePermissions(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getEffectivePermissions(id)
                .stream()
                .map(permission -> permission.getId())
                .toList());
    }
}
