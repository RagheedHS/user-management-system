package com.example.usermanagement.service;

import com.example.usermanagement.dto.RoleDTO;
import com.example.usermanagement.model.Role;
import java.util.List;

public interface RoleService {
    List<RoleDTO> getAllRoles();
    RoleDTO getRoleById(Long id);
    RoleDTO createRole(RoleDTO roleDTO);
    RoleDTO updateRole(Long id, RoleDTO roleDTO);
    void deleteRole(Long id);
    Role findRoleEntityById(Long id); // internal use
}
