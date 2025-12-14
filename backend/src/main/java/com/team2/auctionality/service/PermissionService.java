package com.team2.auctionality.service;

import com.team2.auctionality.model.Permission;
import com.team2.auctionality.model.Role;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.RoleRepository;
import com.team2.auctionality.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service to resolve permissions from roles.
 * This allows us to store only roles in JWT tokens and resolve permissions server-side.
 */
@Service
@RequiredArgsConstructor
public class PermissionService {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    /**
     * Get all permissions for a user based on their roles.
     * 
     * @param user The user entity
     * @return Set of permission names
     */
    @Transactional(readOnly = true)
    public Set<String> getPermissionsForUser(User user) {
        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());
    }

    /**
     * Get all permissions for a user by email.
     * 
     * @param email User email
     * @return Set of permission names
     */
    @Transactional(readOnly = true)
    public Set<String> getPermissionsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return getPermissionsForUser(user);
    }

    /**
     * Get all permissions for a role by role name.
     * 
     * @param roleName Role name (e.g., "BUYER", "SELLER")
     * @return Set of permission names
     */
    @Transactional(readOnly = true)
    public Set<String> getPermissionsForRole(String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        return role.getPermissions().stream()
                .map(Permission::getName)
                .collect(Collectors.toSet());
    }

    /**
     * Check if a user has a specific permission.
     * 
     * @param user User entity
     * @param permissionName Permission name to check
     * @return true if user has the permission
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(User user, String permissionName) {
        return getPermissionsForUser(user).contains(permissionName);
    }
}

