package com.team2.auctionality.controller;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.exception.AuthException;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication API")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = authService.register(request);
        setTokenCookies(httpResponse, response.getAccessToken(), response.getRefreshToken());
        // Remove tokens from response body for security
        response.setAccessToken(null);
        response.setRefreshToken(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = authService.login(request);
        // Set cookies with tokens (tokens are still in response for backward compatibility)
        setTokenCookies(httpResponse, response.getAccessToken(), response.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<AuthResponse> refreshToken(
            @CookieValue(value = "refreshToken", required = false) String refreshTokenCookie,
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletResponse httpResponse
    ) {
        // Try to get refresh token from cookie first, fallback to request body
        String refreshToken = refreshTokenCookie != null ? refreshTokenCookie : 
                              (request != null ? request.getRefreshToken() : null);
        
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new com.team2.auctionality.exception.TokenInvalidException("Refresh token is required");
        }
        
        AuthResponse response = authService.refreshToken(refreshToken);
        // Set cookies with new tokens (tokens are still in response for backward compatibility)
        setTokenCookies(httpResponse, response.getAccessToken(), response.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email with OTP token")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        authService.verifyEmail(request.getToken());
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification OTP")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            throw new AuthException("Email is required");
        }
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(Map.of("message", "Verification email sent"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            throw new AuthException("Email is required");
        }
        authService.forgotPassword(email);
        return ResponseEntity.ok(Map.of("message", "Password reset email sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<Map<String, String>> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshTokenCookie,
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletResponse httpResponse
    ) {
        // Try to get refresh token from cookie first, fallback to request body
        String refreshToken = refreshTokenCookie != null ? refreshTokenCookie : 
                              (request != null ? request.getRefreshToken() : null);
        
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }
        
        // Clear cookies
        clearTokenCookies(httpResponse);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
    
    /**
     * Set httpOnly cookies for access and refresh tokens
     */
    private void setTokenCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // Only set cookies if tokens are not null and not empty
        if (accessToken != null && !accessToken.isBlank()) {
            // Access token cookie - short-lived, httpOnly, secure, sameSite
            Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
            accessTokenCookie.setHttpOnly(true);
            // Only set secure in production (HTTPS)
            // accessTokenCookie.setSecure(true);
            accessTokenCookie.setPath("/");
            accessTokenCookie.setMaxAge(60 * 60); // 1 hour (matching jwt.access-token-expiration)
            // For Spring Boot 3.x, use ResponseCookie for SameSite
            response.addCookie(accessTokenCookie);
        }
        
        if (refreshToken != null && !refreshToken.isBlank()) {
            // Refresh token cookie - long-lived, httpOnly, secure, sameSite
            Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
            refreshTokenCookie.setHttpOnly(true);
            // Only set secure in production (HTTPS)
            // refreshTokenCookie.setSecure(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(refreshTokenCookie);
        }
    }
    
    /**
     * Clear token cookies on logout
     */
    private void clearTokenCookies(HttpServletResponse response) {
        Cookie accessTokenCookie = new Cookie("accessToken", "");
        accessTokenCookie.setHttpOnly(true);
        // accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);
        response.addCookie(accessTokenCookie);
        
        Cookie refreshTokenCookie = new Cookie("refreshToken", "");
        refreshTokenCookie.setHttpOnly(true);
        // refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user information")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        // Get user email from authentication
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        return ResponseEntity.ok(authService.getCurrentUser(user));
    }
}

