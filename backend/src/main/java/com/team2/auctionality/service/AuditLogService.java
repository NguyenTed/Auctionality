package com.team2.auctionality.service;

import com.team2.auctionality.model.User;
import com.team2.auctionality.model.UserAuditLog;
import com.team2.auctionality.repository.UserAuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

/**
 * Service for logging user actions for audit purposes
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final UserAuditLogRepository auditLogRepository;

    /**
     * Log a user action asynchronously
     * 
     * @param user The user performing the action
     * @param action The action description (e.g., "LOGIN", "REGISTER", "UPDATE_PROFILE")
     */
    @Async
    @Transactional
    public void logUserAction(User user, String action) {
        try {
            String ipAddress = getClientIpAddress();
            String userAgent = getUserAgent();

            UserAuditLog auditLog = UserAuditLog.builder()
                    .user(user)
                    .action(action)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .createdAt(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log saved: user={}, action={}, ip={}", user.getId(), action, ipAddress);
        } catch (Exception e) {
            // Don't let audit logging failures break the main flow
            log.error("Failed to save audit log: user={}, action={}", user != null ? user.getId() : "null", action, e);
        }
    }

    /**
     * Log a user action with custom IP and user agent
     * Useful when request context is not available
     */
    @Async
    @Transactional
    public void logUserAction(User user, String action, String ipAddress, String userAgent) {
        try {
            UserAuditLog auditLog = UserAuditLog.builder()
                    .user(user)
                    .action(action)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .createdAt(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log saved: user={}, action={}, ip={}", user.getId(), action, ipAddress);
        } catch (Exception e) {
            log.error("Failed to save audit log: user={}, action={}", user != null ? user.getId() : "null", action, e);
        }
    }

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                // Check for X-Forwarded-For header (for proxies/load balancers)
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    // X-Forwarded-For can contain multiple IPs, take the first one
                    return xForwardedFor.split(",")[0].trim();
                }
                
                // Check for X-Real-IP header
                String xRealIp = request.getHeader("X-Real-IP");
                if (xRealIp != null && !xRealIp.isEmpty()) {
                    return xRealIp;
                }
                
                // Fallback to remote address
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.warn("Failed to extract IP address", e);
        }
        return "unknown";
    }

    /**
     * Get user agent from request
     */
    private String getUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String userAgent = request.getHeader("User-Agent");
                return userAgent != null ? userAgent : "unknown";
            }
        } catch (Exception e) {
            log.warn("Failed to extract user agent", e);
        }
        return "unknown";
    }
}

