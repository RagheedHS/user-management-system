package com.example.demo.service;

import com.example.demo.dto.CreateRoleRequest;
import com.example.demo.dto.RoleDTO;
import com.example.demo.dto.RoleHierarchyDTO;
import com.example.demo.dto.UpdateRoleRequest;
import com.example.demo.entity.Permission;
import com.example.demo.entity.Role;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.specification.RoleSpecification;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AuditLogService auditLogService;
    private final com.example.demo.repository.UserRepository userRepository;

    public RoleDTO createRole(CreateRoleRequest request, String username) {
        if (roleRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Role with name '" + request.getName() + "' already exists");
        }

        Role role = new Role();
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role.setRoleLevel(request.getRoleLevel());
        role.setActive(Boolean.TRUE.equals(request.getActive()));

        if (!CollectionUtils.isEmpty(request.getPermissionIds())) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(request.getPermissionIds()));
            role.setPermissions(permissions);
        } else {
            role.setPermissions(Collections.emptySet());
        }

        if (request.getParentRoleId() != null) {
            Role parentRole = roleRepository.findById(request.getParentRoleId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent role not found with id: " + request.getParentRoleId()));
            if (isCircularParent(role, parentRole)) {
                throw new IllegalArgumentException("Circular role hierarchy detected");
            }
            role.setParentRole(parentRole);
        }

        Role saved = roleRepository.save(role);
        auditLogService.log(username, "ROLE_CREATED", "Role", saved.getId(), "Created role " + saved.getName());
        return convertToDTO(saved);
    }

    public RoleDTO getRoleById(Long id) {
        Role role = getRole(id);
        return convertToDTO(role);
    }

    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll(Sort.by(Sort.Direction.ASC, "roleLevel"))
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoleDTO> getActiveRoles() {
        return roleRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<RoleDTO> getRoles(String search, Boolean active, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Specification<Role> spec = Specification.where(RoleSpecification.hasSearch(search));
        if (active != null) {
            spec = spec.and(RoleSpecification.hasActive(active));
        }
        Page<Role> roles = roleRepository.findAll(spec, pageable);
        return roles.map(this::convertToDTO);
    }

    public RoleDTO updateRole(Long id, UpdateRoleRequest request, String username) {
        Role role = getRole(id);
        role.setDescription(request.getDescription());
        role.setRoleLevel(request.getRoleLevel());
        if (request.getActive() != null) {
            role.setActive(request.getActive());
        }

        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(request.getPermissionIds()));
            role.setPermissions(permissions);
        }

        if (request.getParentRoleId() != null) {
            Role parentRole = roleRepository.findById(request.getParentRoleId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent role not found with id: " + request.getParentRoleId()));
            if (isCircularParent(role, parentRole)) {
                throw new IllegalArgumentException("Circular role hierarchy detected");
            }
            role.setParentRole(parentRole);
        } else {
            role.setParentRole(null);
        }

        Role saved = roleRepository.save(role);
        auditLogService.log(username, "ROLE_UPDATED", "Role", saved.getId(), "Updated role " + saved.getName());
        return convertToDTO(saved);
    }

    public void deleteRole(Long id, String username) {
    Role role = getRole(id);
    
    long usersWithRole = userRepository.countByRoleId(id);
    if (usersWithRole > 0) {
        throw new IllegalArgumentException(
            "Cannot delete role '" + role.getName() + "' because it is assigned to " + usersWithRole + " user(s). Please reassign them first."
        );
    }

    roleRepository.delete(role);
    auditLogService.log(username, "ROLE_DELETED", "Role", id, "Deleted role " + role.getName());
}

    public RoleDTO addPermissionToRole(Long roleId, Long permissionId, String username) {
        Role role = getRole(roleId);
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id: " + permissionId));
        if (role.getPermissions() == null) {
            role.setPermissions(new HashSet<>());
        }
        role.getPermissions().add(permission);
        Role saved = roleRepository.save(role);
        auditLogService.log(username, "ROLE_PERMISSION_ADDED", "Role", saved.getId(), "Added permission " + permission.getName());
        return convertToDTO(saved);
    }

    public RoleDTO removePermissionFromRole(Long roleId, Long permissionId, String username) {
        Role role = getRole(roleId);
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id: " + permissionId));
        if (role.getPermissions() != null) {
            role.getPermissions().remove(permission);
        }
        Role saved = roleRepository.save(role);
        auditLogService.log(username, "ROLE_PERMISSION_REMOVED", "Role", saved.getId(), "Removed permission " + permission.getName());
        return convertToDTO(saved);
    }

    public List<RoleHierarchyDTO> getHierarchy() {
        List<Role> roles = roleRepository.findAll(Sort.by(Sort.Direction.DESC, "roleLevel"));
        Map<Long, RoleHierarchyDTO> dtoById = new HashMap<>();

        for (Role role : roles) {
            dtoById.put(role.getId(), convertToHierarchyDTO(role));
        }

        List<RoleHierarchyDTO> roots = new ArrayList<>();
        for (RoleHierarchyDTO dto : dtoById.values()) {
            if (dto.getParentRoleId() == null) {
                roots.add(dto);
            } else {
                RoleHierarchyDTO parent = dtoById.get(dto.getParentRoleId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(dto);
                } else {
                    roots.add(dto);
                }
            }
        }

        return roots;
    }

    public RoleDTO updateParent(Long id, Long parentRoleId, String username) {
        Role role = getRole(id);
        if (parentRoleId == null) {
            role.setParentRole(null);
        } else {
            Role parentRole = roleRepository.findById(parentRoleId)
                    .orElseThrow(() -> new EntityNotFoundException("Parent role not found with id: " + parentRoleId));
            if (isCircularParent(role, parentRole)) {
                throw new IllegalArgumentException("Circular role hierarchy detected");
            }
            role.setParentRole(parentRole);
        }
        Role saved = roleRepository.save(role);
        auditLogService.log(username, "ROLE_HIERARCHY_UPDATED", "Role", saved.getId(), "Updated parent role to " + (parentRoleId == null ? "none" : parentRoleId));
        return convertToDTO(saved);
    }

    public Set<Permission> getEffectivePermissions(Long roleId) {
        Role role = getRole(roleId);
        return collectEffectivePermissions(role, new HashSet<>());
    }

    private Role getRole(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + id));
    }

    private Set<Permission> collectEffectivePermissions(Role role, Set<Permission> aggregated) {
        if (role == null) {
            return aggregated;
        }
        if (role.getPermissions() != null) {
            aggregated.addAll(role.getPermissions());
        }
        if (role.getParentRole() != null) {
            collectEffectivePermissions(role.getParentRole(), aggregated);
        }
        return aggregated;
    }

    private boolean isCircularParent(Role role, Role candidateParent) {
        Role current = candidateParent;
        while (current != null) {
            if (current.getId() != null && current.getId().equals(role.getId())) {
                return true;
            }
            current = current.getParentRole();
        }
        return false;
    }

    private RoleDTO convertToDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setRoleLevel(role.getRoleLevel());
        dto.setActive(role.getActive());
        if (role.getParentRole() != null) {
            dto.setParentRoleId(role.getParentRole().getId());
            dto.setParentRoleName(role.getParentRole().getName());
        }
        if (role.getPermissions() != null) {
            dto.setPermissionIds(role.getPermissions().stream().map(Permission::getId).collect(Collectors.toSet()));
        }
        Set<Permission> directPermissions = role.getPermissions() == null ? Collections.emptySet() : role.getPermissions();
        Set<Permission> effectivePermissions = collectEffectivePermissions(role, new HashSet<>());
        Set<Permission> inheritedPermissions = new HashSet<>(effectivePermissions);
        inheritedPermissions.removeAll(directPermissions);

        dto.setInheritedPermissionIds(inheritedPermissions.stream().map(Permission::getId).collect(Collectors.toSet()));
        dto.setEffectivePermissionIds(effectivePermissions.stream().map(Permission::getId).collect(Collectors.toSet()));
        dto.setEffectivePermissionNames(effectivePermissions.stream().map(Permission::getName).collect(Collectors.toSet()));

        return dto;
    }

    private RoleHierarchyDTO convertToHierarchyDTO(Role role) {
        RoleHierarchyDTO dto = new RoleHierarchyDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setRoleLevel(role.getRoleLevel());
        dto.setActive(role.getActive());
        if (role.getParentRole() != null) {
            dto.setParentRoleId(role.getParentRole().getId());
            dto.setParentRoleName(role.getParentRole().getName());
        }
        Set<Permission> directPermissions = role.getPermissions() == null ? Collections.emptySet() : role.getPermissions();
        Set<Permission> effectivePermissions = collectEffectivePermissions(role, new HashSet<>());
        Set<Permission> inheritedPermissions = new HashSet<>(effectivePermissions);
        inheritedPermissions.removeAll(directPermissions);

        dto.setDirectPermissionIds(directPermissions.stream().map(Permission::getId).collect(Collectors.toSet()));
        dto.setInheritedPermissionIds(inheritedPermissions.stream().map(Permission::getId).collect(Collectors.toSet()));
        dto.setEffectivePermissionIds(effectivePermissions.stream().map(Permission::getId).collect(Collectors.toSet()));
        dto.setChildren(new ArrayList<>());
        return dto;
    }
}
