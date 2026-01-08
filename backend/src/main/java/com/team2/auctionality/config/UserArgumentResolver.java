package com.team2.auctionality.config;

import com.team2.auctionality.model.User;
import com.team2.auctionality.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserArgumentResolver implements HandlerMethodArgumentResolver {

    private final AuthService authService;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class) &&
                parameter.getParameterType().equals(User.class);
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        Authentication authentication = (Authentication) webRequest.getUserPrincipal();
        if (authentication == null) {
            log.info("No authentication principal available for WebSocket request");
            return null;
        }

        Object principal = authentication.getPrincipal();
        log.info("Resolving @CurrentUser from authentication: principalType={}, principal={}",
                principal != null ? principal.getClass().getName() : "null", principal);

        // If principal is already our User entity, return it directly
        if (principal instanceof User) {
            return (User) principal;
        }

        // Fallback: use authentication.getName() as email and lookup user
        String email = authentication.getName();
        if (email == null) {
            log.warn("Authentication name is null, cannot resolve user");
            return null;
        }
        try {
            return authService.getUserByEmail(email);
        } catch (Exception e) {
            log.warn("Failed to resolve user by email '{}': {}", email, e.getMessage());
            return null;
        }
    }
}

