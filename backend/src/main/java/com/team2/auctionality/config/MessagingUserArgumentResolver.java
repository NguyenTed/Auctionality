package com.team2.auctionality.config;

import com.team2.auctionality.model.User;
import com.team2.auctionality.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.invocation.HandlerMethodArgumentResolver;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * Argument resolver for @CurrentUser in STOMP @MessageMapping handlers.
 * Resolves the current authenticated application User entity (com.team2.auctionality.model.User).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MessagingUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final AuthService authService;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class) &&
                parameter.getParameterType().equals(User.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, Message<?> message) {
        SimpMessageHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, SimpMessageHeaderAccessor.class);
        if (accessor == null) {
            log.debug("SimpMessageHeaderAccessor not available, cannot resolve @CurrentUser");
            return null;
        }

        Principal principal = accessor.getUser();
        if (principal == null) {
            log.debug("No Principal available in message headers to resolve @CurrentUser");
            // Try SecurityContext as fallback
            Authentication auth = (Authentication) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                principal = auth;
            }
        }

        if (principal instanceof Authentication) {
            Object p = ((Authentication) principal).getPrincipal();
            log.debug("Messaging principal type: {}, principal: {}", p != null ? p.getClass().getName() : "null", p);
            if (p instanceof User) {
                return (User) p;
            }
            if (p instanceof UserDetails) {
                String username = ((UserDetails) p).getUsername();
                try {
                    return authService.getUserByEmail(username);
                } catch (Exception e) {
                    log.warn("Failed to load User entity for username '{}': {}", username, e.getMessage());
                    return null;
                }
            }
            // Fallback: try name
            String name = ((Authentication) principal).getName();
            if (name != null) {
                try {
                    return authService.getUserByEmail(name);
                } catch (Exception e) {
                    log.warn("Failed to load User entity for principal name '{}': {}", name, e.getMessage());
                }
            }
        } else if (principal != null) {
            // principal is not Authentication, maybe it's a String username
            String name = principal.getName();
            if (name != null) {
                try {
                    return authService.getUserByEmail(name);
                } catch (Exception e) {
                    log.warn("Failed to load User entity for principal name '{}': {}", name, e.getMessage());
                }
            }
        }

        return null;
    }
}
