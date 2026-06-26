package com.example.demo;

import com.example.demo.dto.UserDTO;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.cache.CacheManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.cache.type=simple", // use simple in-memory cache for testing so we don't need a running Redis
        "spring.datasource.url=jdbc:h2:mem:test_cache_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE"
})
public class CacheVerificationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private CacheManager cacheManager;

    @MockitoSpyBean
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Long testUserId;
    private Long adminRoleId;

    @BeforeEach
    void setUp() {
        // Clear all caches before each test
        cacheManager.getCacheNames().forEach(cacheName -> cacheManager.getCache(cacheName).clear());

        // Delete all users to avoid unique constraint violations between test runs
        userRepository.deleteAll();

        // Find or create an admin role
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setName("ADMIN");
            role.setDescription("Administrator");
            role.setRoleLevel(100);
            role.setActive(true);
            return roleRepository.save(role);
        });
        adminRoleId = adminRole.getId();

        // Create a test user
        User user = new User();
        user.setUsername("cache_test_user");
        user.setEmail("cache_test@example.com");
        user.setPassword("password123");
        user.setFirstName("Cache");
        user.setLastName("Test");
        user.setActive(true);
        user.setRole(adminRole);

        user = userRepository.save(user);
        testUserId = user.getId();

        // Reset the spy so we don't count the setup save/delete actions
        Mockito.reset(userRepository);
    }

    @Test
    void testGetUserByIdCaching() {
        // 1. First lookup: should call the repository (cache miss)
        UserDTO user1 = userService.getUserById(testUserId);
        assertNotNull(user1);
        verify(userRepository, times(1)).findById(testUserId);

        // 2. Second lookup: should NOT call the repository (cache hit)
        UserDTO user2 = userService.getUserById(testUserId);
        assertNotNull(user2);
        verify(userRepository, times(1)).findById(testUserId); // Still 1 invocation
        assertEquals(user1.getUsername(), user2.getUsername());
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN", "UPDATE_USER"})
    void testUpdateUserEvictsCache() {
        // 1. Cache the user DTO
        userService.getUserById(testUserId);
        verify(userRepository, times(1)).findById(testUserId);

        // 2. Perform an update
        UserDTO updateDto = new UserDTO();
        updateDto.setFirstName("UpdatedFirstName");
        userService.updateUser(testUserId, updateDto, adminRoleId);

        // Reset spy count for next verification
        Mockito.reset(userRepository);

        // 3. Lookup user again: should be a cache miss (repository called again)
        UserDTO userAfterUpdate = userService.getUserById(testUserId);
        assertNotNull(userAfterUpdate);
        assertEquals("UpdatedFirstName", userAfterUpdate.getFirstName());
        verify(userRepository, times(1)).findById(testUserId);
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void testChangePasswordEvictsCache() {
        // 1. Cache the user DTO
        userService.getUserById(testUserId);
        verify(userRepository, times(1)).findById(testUserId);

        // 2. Change password (using mock ADMIN user to bypass old password check easily)
        userService.changePassword(testUserId, null, "newPassword123");

        // Reset spy count
        Mockito.reset(userRepository);

        // 3. Lookup user again: should be a cache miss (repository called again due to eviction)
        UserDTO user = userService.getUserById(testUserId);
        assertNotNull(user);
        verify(userRepository, times(1)).findById(testUserId);
    }

    @Test
    @WithMockUser(authorities = {"ROLE_ADMIN"})
    void testResetPasswordEvictsCache() {
        // 1. Cache the user DTO
        userService.getUserById(testUserId);
        verify(userRepository, times(1)).findById(testUserId);

        // 2. Reset password
        userService.resetPassword(testUserId, "resetPassword123");

        // Reset spy count
        Mockito.reset(userRepository);

        // 3. Lookup user again: should be a cache miss (repository called again due to eviction)
        UserDTO user = userService.getUserById(testUserId);
        assertNotNull(user);
        verify(userRepository, times(1)).findById(testUserId);
    }

    @Test
    void testGetActiveUsersCaching() {
        // 1. First lookup: should call repository
        userService.getActiveUsers();
        verify(userRepository, times(1)).findByActiveTrue();

        // 2. Second lookup: should NOT call repository (cache hit)
        userService.getActiveUsers();
        verify(userRepository, times(1)).findByActiveTrue();
    }
}
