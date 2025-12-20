package com.team2.auctionality.service;

import com.team2.auctionality.exception.AccessDeniedException;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to get current authenticated user and perform authorization checks.
 * This service provides utilities for service-level authorization.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityService {
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    /**
     * Get the current authenticated user.
     * 
     * @return Current user entity
     * @throws AccessDeniedException if user is not authenticated
     */
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("User not found"));
    }

    /**
     * Get the current authenticated user ID.
     * 
     * @return Current user ID
     * @throws AccessDeniedException if user is not authenticated
     */
    public Integer getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Check if the current user has a specific permission.
     * 
     * @param permissionName Permission name to check
     * @return true if user has the permission
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(String permissionName) {
        try {
            User user = getCurrentUser();
            return permissionService.hasPermission(user, permissionName);
        } catch (AccessDeniedException e) {
            return false;
        }
    }

    /**
     * Check if the current user has a specific permission, throw exception if not.
     * 
     * @param permissionName Permission name to check
     * @throws AccessDeniedException if user doesn't have the permission
     */
    @Transactional(readOnly = true)
    public void requirePermission(String permissionName) {
        if (!hasPermission(permissionName)) {
            throw new AccessDeniedException("You do not have permission: " + permissionName);
        }
    }

    /**
     * Check if the current user has a specific role.
     * 
     * @param roleName Role name to check (e.g., "SELLER", "ADMIN")
     * @return true if user has the role
     */
    public boolean hasRole(String roleName) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return false;
            }
            
            return authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + roleName.toUpperCase()));
        } catch (Exception e) {
            log.debug("Error checking role: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if the current user has a specific role, throw exception if not.
     * 
     * @param roleName Role name to check
     * @throws AccessDeniedException if user doesn't have the role
     */
    public void requireRole(String roleName) {
        if (!hasRole(roleName)) {
            throw new AccessDeniedException("You do not have the required role: " + roleName);
        }
    }

    /**
     * Check if the current user is the owner of a resource (by user ID).
     * 
     * @param resourceUserId User ID of the resource owner
     * @return true if current user owns the resource
     */
    public boolean isOwner(Integer resourceUserId) {
        try {
            Integer currentUserId = getCurrentUserId();
            return currentUserId != null && currentUserId.equals(resourceUserId);
        } catch (AccessDeniedException e) {
            return false;
        }
    }

    /**
     * Check if the current user is the owner of a resource, throw exception if not.
     * 
     * @param resourceUserId User ID of the resource owner
     * @throws AccessDeniedException if user is not the owner
     */
    public void requireOwnership(Integer resourceUserId) {
        if (!isOwner(resourceUserId)) {
            throw new AccessDeniedException("You do not have access to this resource");
        }
    }
}

