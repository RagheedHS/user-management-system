package com.example.demo.service;

import com.example.demo.entity.Permission;
import com.example.demo.dto.PermissionDTO;
import com.example.demo.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final PermissionRepository permissionRepository;

    public PermissionDTO createPermission(PermissionDTO dto) {
        if (permissionRepository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Permission with name '" + dto.getName() + "' already exists");
        }
        Permission permission = new Permission();
        permission.setName(dto.getName());
        permission.setDescription(dto.getDescription());
        permission.setCategory(dto.getCategory());
        permission.setActive(true);
        return convertToDTO(permissionRepository.save(permission));
    }

    public PermissionDTO getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));
        return convertToDTO(permission);
    }

    public List<PermissionDTO> getAllPermissions() {
        return permissionRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public PermissionDTO updatePermission(Long id, PermissionDTO dto) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));
        
        permission.setDescription(dto.getDescription());
        permission.setCategory(dto.getCategory());
        permission.setActive(dto.getActive());
        return convertToDTO(permissionRepository.save(permission));
    }

    public void deletePermission(Long id) {
        if (!permissionRepository.existsById(id)) {
            throw new RuntimeException("Permission not found with id: " + id);
        }
        permissionRepository.deleteById(id);
    }

    private PermissionDTO convertToDTO(Permission permission) {
        return new PermissionDTO(
            permission.getId(),
            permission.getName(),
            permission.getDescription(),
            permission.getCategory(),
            permission.getActive()
        );
    }
}
