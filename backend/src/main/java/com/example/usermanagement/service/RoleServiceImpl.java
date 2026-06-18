package com.example.usermanagement.service;

import com.example.usermanagement.dto.RoleDTO;
import com.example.usermanagement.model.Role;
import com.example.usermanagement.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(RoleDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return new RoleDTO(role);
    }

    @Override
    public RoleDTO createRole(RoleDTO roleDTO) {
        Role role = new Role();
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        // Permissions handling could be added later
        Role saved = roleRepository.save(role);
        return new RoleDTO(saved);
    }

    @Override
    public RoleDTO updateRole(Long id, RoleDTO roleDTO) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        // Permissions handling omitted for brevity
        Role saved = roleRepository.save(role);
        return new RoleDTO(saved);
    }

    @Override
    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }

    @Override
    public Role findRoleEntityById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }
}
