package com.team2.auctionality.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Simple in-memory rate limiting service
 * Uses sliding window algorithm
 */
@Service
@Slf4j
public class RateLimitService {

    // Key: identifier (user ID or IP), Value: queue of request timestamps
    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<Long>> rateLimitStore = new ConcurrentHashMap<>();

    /**
     * Check if request should be allowed
     * @param identifier User ID (if authenticated) or IP address
     * @param maxRequests Maximum number of requests allowed
     * @param windowSeconds Time window in seconds
     * @return true if allowed, false if rate limited
     */
    public boolean isAllowed(String identifier, int maxRequests, int windowSeconds) {
        long now = Instant.now().getEpochSecond();
        long windowStart = now - windowSeconds;

        // Get or create queue for this identifier
        ConcurrentLinkedQueue<Long> requestTimestamps = rateLimitStore.computeIfAbsent(
            identifier,
            k -> new ConcurrentLinkedQueue<>()
        );

        // Remove requests outside the window
        requestTimestamps.removeIf(timestamp -> timestamp < windowStart);

        // Check if we can add a new request
        if (requestTimestamps.size() >= maxRequests) {
            log.warn("Rate limit exceeded for identifier: {} ({} requests in {} seconds)", 
                    identifier, requestTimestamps.size(), windowSeconds);
            return false;
        }

        // Add current request
        requestTimestamps.offer(now);
        return true;
    }

    /**
     * Get remaining requests for an identifier
     */
    public int getRemainingRequests(String identifier, int maxRequests, int windowSeconds) {
        ConcurrentLinkedQueue<Long> requestTimestamps = rateLimitStore.get(identifier);
        
        if (requestTimestamps == null) {
            return maxRequests;
        }

        long now = Instant.now().getEpochSecond();
        long windowStart = now - windowSeconds;
        requestTimestamps.removeIf(timestamp -> timestamp < windowStart);
        
        return Math.max(0, maxRequests - requestTimestamps.size());
    }

    /**
     * Clear rate limit data for an identifier (useful for testing)
     */
    public void clear(String identifier) {
        rateLimitStore.remove(identifier);
    }
}
