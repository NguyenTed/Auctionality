package com.team2.auctionality.config;

import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.UserRepository;
import com.team2.auctionality.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

/**
 * WebSocket Authentication Interceptor
 * Extracts JWT token from STOMP headers and authenticates the user
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        StompCommand command = accessor.getCommand();

        // CONNECT frame → cho anonymous
        if (StompCommand.CONNECT.equals(command)) {
            log.info("CONNECT frame received, skipping authentication (anonymous allowed)");
        }
        // SEND hoặc SUBSCRIBE → authenticate
        else if (StompCommand.SEND.equals(command) || StompCommand.SUBSCRIBE.equals(command)) {
            log.info("SEND/SUBSCRIBE headers: {}", accessor.toMap());
            authenticateFromHeaders(accessor);
            Authentication auth = (Authentication) accessor.getUser();
            if (auth != null) {
                Object principal = auth.getPrincipal();
                if (principal instanceof User) {
                    log.info("WebSocket authenticated user: {} (ID: {})",
                            ((User) principal).getEmail(),
                            ((User) principal).getId());
                } else {
                    log.info("WebSocket authenticated principal: {}", principal);
                }
            }
        }

        return message;
    }

    private boolean authenticateFromHeaders(StompHeaderAccessor accessor) {
        // Extract token from headers
        String token = null;

        // Method 1: Try getFirstNativeHeader (works for CONNECT and SEND)
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // Method 2: Try getNativeHeader (returns list) - fallback
        if (token == null) {
            java.util.List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String header = authHeaders.get(0);
                if (header != null && header.startsWith("Bearer ")) {
                    token = header.substring(7);
                }
            }
        }

        // Log all headers for debugging on CONNECT
        if (token == null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("No Authorization header found in CONNECT frame. Available headers: {}", accessor.toMap());
        }

        if (token != null && !token.isBlank()) {
            try {
                String userEmail = jwtService.extractEmail(token);
                if (userEmail != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                    if (jwtService.validateToken(token, userDetails)) {
                        // Get User entity
                        User user = userRepository.findByEmail(userEmail).orElse(null);
                        if (user == null) {
                            log.error("WebSocket authentication failed: User not found for email: {}", userEmail);
                            return false;
                        }

                        // Create authentication with User entity (not UserDetails)
                        // This allows @CurrentUser to inject User directly
                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                                user, // Principal is User entity
                                null, // Credentials
                                userDetails.getAuthorities()
                        );

                        // Set authentication in accessor and SecurityContext
                        accessor.setUser(authentication);
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        log.info("WebSocket authenticated user: {} (ID: {})", userEmail, user.getId());
                        return true;
                    } else {
                        log.warn("WebSocket JWT token validation failed for user: {}", userEmail);
                    }
                } else {
                    log.warn("WebSocket JWT token does not contain email");
                }
            } catch (Exception e) {
                log.error("WebSocket authentication failed: {}", e.getMessage(), e);
            }
        } else {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                log.warn("No JWT token found in WebSocket CONNECT frame headers");
            }
        }

        return false;
    }
}

