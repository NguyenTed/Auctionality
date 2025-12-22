package com.team2.auctionality.config;

import com.team2.auctionality.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Service to set PostgreSQL session variables for Row-Level Security (RLS).
 * Sets app.user_id based on the authenticated user from Spring Security context.
 * 
 * IMPORTANT: RLS policies must be enabled in the database by running RLSPolicies.sql
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class RlsSessionVariableService {
    private final JwtService jwtService;

    /**
     * Set PostgreSQL session variables for the current connection.
     * Uses SET LOCAL to ensure variables are scoped to the current transaction.
     * 
     * @param connection Database connection
     */
    public void setSessionVariables(Connection connection) {
        if (connection == null) {
            return;
        }

        try {
            Integer userId = getCurrentUserId();
            
            // Use SET LOCAL to set variable for current transaction only
            // This ensures the variable is automatically cleared when transaction ends
            // For unauthenticated users (userId is null), don't set the variable
            // RLS policies will handle NULL correctly via current_setting('app.user_id', true)::INTEGER
            if (userId != null) {
                String sql = "SET LOCAL app.user_id = " + userId;
                try (var stmt = connection.createStatement()) {
                    stmt.execute(sql);
                    log.debug("Set RLS session variable app.user_id = {}", userId);
                }
            } else {
                log.debug("No authenticated user - skipping RLS session variable setting");
            }
        } catch (SQLException e) {
            log.warn("Failed to set RLS session variables: {}", e.getMessage());
            // Don't throw exception - allow query to proceed without RLS if setting fails
        }
    }

    /**
     * Get current user ID from Spring Security context or JWT token.
     * Priority: Authentication details > JWT from request header
     */
    private Integer getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }

            // First, try to get userId from Authentication details (set by JwtAuthenticationFilter)
            Object details = authentication.getDetails();
            if (details instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> detailsMap = (java.util.Map<String, Object>) details;
                Object userIdObj = detailsMap.get("userId");
                if (userIdObj instanceof Integer) {
                    return (Integer) userIdObj;
                }
            }

            // Fallback: Extract from JWT token in request header
            return extractUserIdFromRequest();
            
        } catch (Exception e) {
            log.debug("Could not extract user ID: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract user ID from JWT token in request header.
     */
    private Integer extractUserIdFromRequest() {
        try {
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            
            if (attributes == null) {
                return null;
            }

            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtService.extractUserId(token);
            }
        } catch (Exception e) {
            log.debug("Could not extract user ID from request: {}", e.getMessage());
        }
        
        return null;
    }
}

