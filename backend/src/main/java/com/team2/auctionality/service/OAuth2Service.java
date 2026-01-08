package com.team2.auctionality.service;

import com.team2.auctionality.dto.AuthResponse;
import com.team2.auctionality.dto.UserDto;
import com.team2.auctionality.exception.AuthException;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.*;
import com.team2.auctionality.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for handling OAuth2 social login
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SocialLoginAccountRepository socialLoginAccountRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final PermissionService permissionService;

    /**
     * Process OAuth2 login - create or link user account
     * 
     * @param oAuth2User The OAuth2 user from provider
     * @param provider The provider name (google, facebook, github)
     * @return AuthResponse with tokens
     */
    @Transactional
    public AuthResponse processOAuth2Login(OAuth2User oAuth2User, String provider) {
        log.info("Processing OAuth2 login for provider: {}", provider);

        // Extract user information from OAuth2 user
        String email = extractEmail(oAuth2User, provider);
        String name = extractName(oAuth2User, provider);
        String providerUserId = extractProviderUserId(oAuth2User, provider);

        if (email == null || email.isBlank()) {
            throw new AuthException("Email is required for OAuth2 login");
        }

        if (providerUserId == null || providerUserId.isBlank()) {
            throw new AuthException("Provider user ID is required");
        }

        // Check if social login account already exists
        SocialLoginAccount existingSocialAccount = socialLoginAccountRepository
                .findByProviderAndProviderUserId(provider, providerUserId)
                .orElse(null);

        User user;

        if (existingSocialAccount != null) {
            // Existing social login - use existing user
            log.info("Found existing social login account for provider: {}, user: {}", 
                    provider, existingSocialAccount.getUser().getId());
            user = existingSocialAccount.getUser();
        } else {
            // New social login - check if user with email exists
            user = userRepository.findByEmail(email).orElse(null);

            if (user != null) {
                // User exists but no social login account - link it
                log.info("Linking existing user {} to {} social login", user.getId(), provider);
                SocialLoginAccount socialAccount = new SocialLoginAccount();
                socialAccount.setUser(user);
                socialAccount.setProvider(provider);
                socialAccount.setProviderUserId(providerUserId);
                socialLoginAccountRepository.save(socialAccount);
            } else {
                // New user - create account
                log.info("Creating new user from OAuth2 login: {}", email);
                user = createUserFromOAuth2(email, name, provider, providerUserId);
            }
        }

        // Ensure user is active
        if (!"active".equals(user.getStatus())) {
            throw new AuthException("User account is not active");
        }

        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails, user.getId());
        String refreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

        // Save refresh token
        saveRefreshToken(user, refreshToken);

        // Build auth response
        return buildAuthResponse(accessToken, refreshToken, user);
    }

    /**
     * Build AuthResponse with tokens and user info
     */
    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        // Resolve permissions server-side from roles (not stored in JWT)
        Set<String> permissions = permissionService.getPermissionsForUser(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(getCurrentUser(user))
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    /**
     * Convert User entity to UserDto
     */
    private UserDto getCurrentUser(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        
        UserProfile profile = user.getProfile();
        
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .isEmailVerified(user.getIsEmailVerified())
                .status(user.getStatus())
                .ratingPercent(profile != null ? profile.getRatingPercent() : null)
                .createdAt(user.getCreatedAt())
                .roles(roles)
                .build();
    }

    /**
     * Create a new user from OAuth2 login
     */
    private User createUserFromOAuth2(String email, String name, String provider, String providerUserId) {
        // Assign default BUYER role
        Role buyerRole = roleRepository.findByName("BUYER")
                .orElseThrow(() -> new AuthException("BUYER role not found. Please seed roles first."));

        // Create user
        User user = new User();
        user.setEmail(email);
        // Generate a random password hash (users won't use password login)
        user.setPasswordHash("$2a$12$" + java.util.UUID.randomUUID().toString().replace("-", ""));
        user.setIsEmailVerified(true); // OAuth2 emails are pre-verified
        user.setStatus("active");
        user.setCreatedAt(LocalDateTime.now());

        Set<Role> roles = new HashSet<>();
        roles.add(buyerRole);
        user.setRoles(roles);

        // Create user profile
        UserProfile profile = new UserProfile();
        profile.setFullName(name != null ? name : email.split("@")[0]);
        profile.setRatingPositiveCount(0);
        profile.setRatingNegativeCount(0);
        profile.setRatingPercent(0.0f);
        profile.setUser(user);
        user.setProfile(profile);

        // Save user (profile will be saved via cascade)
        user = userRepository.save(user);

        // Create social login account
        SocialLoginAccount socialAccount = new SocialLoginAccount();
        socialAccount.setUser(user);
        socialAccount.setProvider(provider);
        socialAccount.setProviderUserId(providerUserId);
        socialLoginAccountRepository.save(socialAccount);

        log.info("Created new user {} from OAuth2 login", user.getId());
        return user;
    }

    /**
     * Extract email from OAuth2 user (Google only)
     */
    private String extractEmail(OAuth2User oAuth2User, String provider) {
        // Only Google is supported
        return oAuth2User.getAttribute("email");
    }

    /**
     * Extract name from OAuth2 user (Google only)
     */
    private String extractName(OAuth2User oAuth2User, String provider) {
        // Only Google is supported
        return oAuth2User.getAttribute("name");
    }

    /**
     * Extract provider user ID from OAuth2 user (Google only)
     */
    private String extractProviderUserId(OAuth2User oAuth2User, String provider) {
        // Only Google is supported - use 'sub' attribute
        return oAuth2User.getAttribute("sub");
    }

    /**
     * Save refresh token
     */
    private void saveRefreshToken(User user, String refreshToken) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(refreshToken);
        token.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(token);
    }
}

