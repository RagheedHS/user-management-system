package com.example.demo.service;

import com.example.demo.dto.PermissionDTO;
import com.example.demo.entity.Permission;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.specification.PermissionSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    public Page<PermissionDTO> getPermissions(String search, String category, Boolean active, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Specification<Permission> spec = Specification.where(PermissionSpecification.hasSearch(search))
                .and(PermissionSpecification.hasCategory(category))
                .and(PermissionSpecification.hasActive(active));
        return permissionRepository.findAll(spec, pageable).map(this::convertToDTO);
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
