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
        
        if (accessor == null) {
            log.warn("WebSocket message has no StompHeaderAccessor");
            return message;
        }

        StompCommand command = accessor.getCommand();
        
        // Handle CONNECT - authenticate on connection
        if (StompCommand.CONNECT.equals(command)) {
            log.info("WebSocket CONNECT frame received, attempting authentication");
            log.debug("CONNECT frame headers: {}", accessor.toMap());
            try {
                boolean authenticated = authenticateFromHeaders(accessor);
                if (!authenticated) {
                    log.warn("WebSocket CONNECT authentication failed, but allowing connection to proceed");
                    // Don't block the connection - allow it to proceed even if auth fails
                    // The server can handle unauthenticated connections if needed
                } else {
                    log.info("WebSocket CONNECT authentication successful, connection will proceed");
                }
            } catch (Exception e) {
                log.error("Error during WebSocket CONNECT authentication: {}", e.getMessage(), e);
                // Don't block the connection even if authentication throws an exception
                // Allow it to proceed as unauthenticated
            }
            // MessageHeaderAccessor modifies the message in place
            // The accessor changes are automatically reflected in the message
        }
        // Handle CONNECTED - log successful connection
        else if (StompCommand.CONNECTED.equals(command)) {
            log.info("WebSocket CONNECTED frame being sent to client");
        }
        // Handle SEND - authenticate on message send
        // Always authenticate SEND messages to ensure user is set
        else if (StompCommand.SEND.equals(command)) {
            // Always try to authenticate from headers for SEND commands
            // This ensures the user is available for @CurrentUser annotation
            authenticateFromHeaders(accessor);
        }

        // Always return the message to allow it to proceed
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

