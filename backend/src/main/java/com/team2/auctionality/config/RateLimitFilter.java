package com.team2.auctionality.config;

import com.team2.auctionality.exception.RateLimitExceededException;
import com.team2.auctionality.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Global rate limiting filter that applies to all endpoints
 * Integrates with Spring Security to identify users
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final RateLimitProperties properties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Skip if rate limiting is disabled
        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        // Skip excluded paths
        if (isExcludedPath(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get identifier (user ID if authenticated, otherwise IP address)
        String identifier = getIdentifier(request);
        
        // Get rate limit configuration for this endpoint
        RateLimitConfig config = getRateLimitConfig(requestPath, method);
        
        // Check rate limit
        if (!rateLimitService.isAllowed(identifier, config.getMaxRequests(), config.getWindowSeconds())) {
            int remaining = rateLimitService.getRemainingRequests(identifier, config.getMaxRequests(), config.getWindowSeconds());
            log.warn("Rate limit exceeded for {} on {} {} (remaining: {})", 
                    identifier, method, requestPath, remaining);
            
            throw new RateLimitExceededException(
                    String.format("Rate limit exceeded. Maximum %d requests per %d seconds. Please try again later.", 
                            config.getMaxRequests(), config.getWindowSeconds())
            );
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }

    private boolean isExcludedPath(String path) {
        for (String excludePattern : properties.getExcludePaths()) {
            if (pathMatcher.match(excludePattern, path)) {
                return true;
            }
        }
        return false;
    }

    private String getIdentifier(HttpServletRequest request) {
        if (properties.isUserBased()) {
            // Try to get user ID from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal().toString())) {
                
                // Try to extract user ID from authentication details
                Object details = authentication.getDetails();
                if (details instanceof Map<?, ?> detailsMap) {
                    Object userId = detailsMap.get("userId");
                    if (userId != null) {
                        return "user:" + userId;
                    }
                }
                
                // Fallback to username
                String username = authentication.getName();
                if (username != null && !username.isEmpty()) {
                    return "user:" + username;
                }
            }
        }
        
        // Fallback to IP address
        String ip = getClientIpAddress(request);
        return "ip:" + ip;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private RateLimitConfig getRateLimitConfig(String path, String method) {
        // Check endpoint-specific limit first
        String endpointLimit = properties.getEndpoints().entrySet().stream()
                .filter(entry -> pathMatcher.match(entry.getKey(), path))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(null);

        if (endpointLimit != null) {
            return parseConfig(endpointLimit);
        }

        // Check method-specific limit
        String methodLimit = properties.getMethods().get(method);
        if (methodLimit != null) {
            return parseConfig(methodLimit);
        }

        // Use default limit
        return parseConfig(properties.getDefaultLimit());
    }

    private RateLimitConfig parseConfig(String config) {
        String[] parts = config.split(":");
        if (parts.length != 2) {
            log.warn("Invalid rate limit config: {}, using default", config);
            return parseConfig(properties.getDefaultLimit());
        }

        try {
            int requests = Integer.parseInt(parts[0].trim());
            int window = Integer.parseInt(parts[1].trim());
            return new RateLimitConfig(requests, window);
        } catch (NumberFormatException e) {
            log.warn("Invalid rate limit config format: {}, using default", config);
            return parseConfig(properties.getDefaultLimit());
        }
    }

    private static class RateLimitConfig {
        private final int maxRequests;
        private final int windowSeconds;

        RateLimitConfig(int maxRequests, int windowSeconds) {
            this.maxRequests = maxRequests;
            this.windowSeconds = windowSeconds;
        }

        int getMaxRequests() {
            return maxRequests;
        }

        int getWindowSeconds() {
            return windowSeconds;
        }
    }
}
