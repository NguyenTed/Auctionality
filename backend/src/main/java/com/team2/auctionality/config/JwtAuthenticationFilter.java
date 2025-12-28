package com.team2.auctionality.config;

import com.team2.auctionality.security.JwtService;
import com.team2.auctionality.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain
    ) throws ServletException, IOException {
        String jwt = null;
        
        // Try to get token from Authorization header first
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String tokenFromHeader = authHeader.substring(7);
            if (tokenFromHeader != null && !tokenFromHeader.isBlank()) {
                jwt = tokenFromHeader;
            }
        }
        
        // Fallback to cookie if no valid token in Authorization header
        if (jwt == null || jwt.isBlank()) {
            jakarta.servlet.http.Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (jakarta.servlet.http.Cookie cookie : cookies) {
                    if ("accessToken".equals(cookie.getName())) {
                        String cookieValue = cookie.getValue();
                        // Only use cookie value if it's not empty and looks like a JWT (contains at least one period)
                        if (cookieValue != null && !cookieValue.isBlank() && cookieValue.contains(".")) {
                            jwt = cookieValue;
                            log.debug("Found access token in cookie");
                            break;
                        } else {
                            log.warn("Access token cookie found but value is empty or invalid");
                        }
                    }
                }
            } else {
                log.debug("No cookies found in request");
            }
        }
        
        // Skip if no valid token found
        if (jwt == null || jwt.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String userEmail = jwtService.extractEmail(jwt);

            // If email extracted and user not already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                // Validate token
                if (jwtService.validateToken(jwt, userDetails)) {
                    // Extract user ID from JWT token for RLS
                    Integer userId = jwtService.extractUserId(jwt);
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    
                    // Store user ID in authentication details for RLS service
                    WebAuthenticationDetails webDetails = new WebAuthenticationDetailsSource().buildDetails(request);
                    if (userId != null) {
                        // Store userId in a map in details
                        java.util.Map<String, Object> detailsMap = new java.util.HashMap<>();
                        detailsMap.put("remoteAddress", webDetails.getRemoteAddress());
                        detailsMap.put("sessionId", webDetails.getSessionId());
                        detailsMap.put("userId", userId);
                        authToken.setDetails(detailsMap);
                    } else {
                        authToken.setDetails(webDetails);
                    }
                    
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Log error but continue filter chain
            log.error("Cannot set user authentication: {}", e.getMessage());
            log.debug("JWT authentication error details", e);
        }

        filterChain.doFilter(request, response);
    }
}

