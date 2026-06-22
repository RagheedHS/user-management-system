package com.example.demo.service;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.dto.UserDTO;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.specification.UserSpecification;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO createUser(UserDTO dto, Long roleId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin) {
            throw new AccessDeniedException("Not authorized to create users");
        }

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String tempPassword = generateTempPassword();

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        if (dto.getProfilePhoto() != null) user.setProfilePhoto(dto.getProfilePhoto());
        user.setActive(true);

        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        user.setRole(role);

        UserDTO created = convertToDTO(userRepository.save(user));
        // returned once so the admin can hand it to the new user; never stored or returned again
        created.setTemporaryPassword(tempPassword);
        return created;
    }

    private static final String TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    private static final java.security.SecureRandom RANDOM = new java.security.SecureRandom();

    private static String generateTempPassword() {
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(RANDOM.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public Page<UserDTO> getUsers(int page, int size, String q, String roleName, Boolean active, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        List<Specification<User>> specs = new java.util.ArrayList<>();
        if (UserSpecification.hasSearch(q) != null) specs.add(UserSpecification.hasSearch(q));
        if (UserSpecification.hasActive(active) != null) specs.add(UserSpecification.hasActive(active));
        if (UserSpecification.hasRoleName(roleName) != null) specs.add(UserSpecification.hasRoleName(roleName));
        Specification<User> spec = Specification.allOf(specs);
        return userRepository.findAll(spec, pageable).map(this::convertToDTO);
    }

    public List<UserDTO> getActiveUsers() {
        return userRepository.findByActiveTrue().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public UserDTO updateUser(Long id, UserDTO dto, Long roleId) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        // Admin and Editor (UPDATE_USER) can edit any user including role/active; everyone else
        // (e.g. Reporter) can only edit their own basic profile fields, never role/active.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean canManageUsers = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "UPDATE_USER".equals(a.getAuthority()));
        String authName = auth != null ? auth.getName() : null;
        boolean isSelf = user.getUsername().equals(authName);

        if (!canManageUsers && !isSelf) {
            throw new AccessDeniedException("Not authorized to update this user");
        }
        if (!canManageUsers) {
            if (roleId != null) {
                throw new AccessDeniedException("Not authorized to change role");
            }
            if (dto.getActive() != null) {
                throw new AccessDeniedException("Not authorized to change active status");
            }
        }

        // only update fields that are present in the DTO (allow partial updates)
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getProfilePhoto() != null) user.setProfilePhoto(dto.getProfilePhoto());
        if (dto.getActive() != null) user.setActive(dto.getActive());

        if (roleId != null) {
            Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
            user.setRole(role);
        }

        return convertToDTO(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin) {
            throw new AccessDeniedException("Not authorized to delete users");
        }

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public void changePassword(Long id, String oldPassword, String newPassword) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        String authName = auth != null ? auth.getName() : null;

        if (!isAdmin && !user.getUsername().equals(authName)) {
            throw new AccessDeniedException("Not authorized to change password for this user");
        }

        if (!isAdmin) {
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new IllegalArgumentException("Old password is incorrect");
            }
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin) {
            throw new AccessDeniedException("Not authorized to reset passwords");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setActive(user.getActive());
        dto.setProfilePhoto(user.getProfilePhoto());
        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getId());
            dto.setRoleName(user.getRole().getName());
        }
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
