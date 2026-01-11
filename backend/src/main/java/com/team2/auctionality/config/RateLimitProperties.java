package com.team2.auctionality.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "rate-limit")
@Data
public class RateLimitProperties {
    /**
     * Whether rate limiting is enabled globally
     */
    private boolean enabled = true;

    /**
     * Default rate limit for all endpoints if not specified
     * Format: "requests:windowInSeconds" (e.g., "100:60" = 100 requests per 60 seconds)
     */
    private String defaultLimit = "100:60";

    /**
     * Rate limits per endpoint pattern
     * Key: endpoint pattern (e.g., "/api/auth/**", "/api/bids/**")
     * Value: "requests:windowInSeconds"
     */
    private Map<String, String> endpoints = new HashMap<>();

    /**
     * Rate limits per HTTP method
     * Key: HTTP method (GET, POST, PUT, DELETE, etc.)
     * Value: "requests:windowInSeconds"
     */
    private Map<String, String> methods = new HashMap<>();

    /**
     * Whether to use user-based rate limiting (if authenticated) or IP-based (if not)
     * If true: authenticated users rate limited per user, anonymous users per IP
     * If false: all users rate limited per IP
     */
    private boolean userBased = true;

    /**
     * Endpoints to exclude from rate limiting
     */
    private String[] excludePaths = new String[]{
        "/actuator/**",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/swagger-ui.html"
    };
}
