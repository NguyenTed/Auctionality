package com.team2.auctionality.service;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.exception.*;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.*;
import com.team2.auctionality.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SocialLoginAccountRepository socialLoginAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final PermissionService permissionService;

    // Generate 6-digit OTP
    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        // Assign default BUYER role
        Role buyerRole = roleRepository.findByName("BUYER")
                .orElseThrow(() -> new AuthException("BUYER role not found. Please seed roles first. Run SeedRoles.sql to initialize roles and permissions."));

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsEmailVerified(false);
        user.setStatus("active");
        user.setCreatedAt(LocalDateTime.now());
        
        // Create a new HashSet for roles to avoid collection modification issues
        Set<Role> roles = new HashSet<>();
        roles.add(buyerRole);
        user.setRoles(roles);

        // Create user profile
        UserProfile profile = new UserProfile();
        profile.setFullName(request.getFullName());
        profile.setRatingPositiveCount(0);
        profile.setRatingNegativeCount(0);
        profile.setRatingPercent(0.0f);
        
        // Set bidirectional relationship
        profile.setUser(user);
        user.setProfile(profile);

        // Save user (profile will be saved via cascade)
        user = userRepository.save(user);

        // Generate email verification token (OTP)
        String otp = generateOTP();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(otp);
        verificationToken.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        emailVerificationTokenRepository.save(verificationToken);

        // TODO: Send verification email with OTP
        // emailService.sendVerificationEmail(user.getEmail(), otp);

        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails, user.getId());
        String refreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

        // Save refresh token
        saveRefreshToken(user, refreshToken);

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Load user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        // Check if email is verified (required per proposal)
        if (!user.getIsEmailVerified()) {
            throw new EmailNotVerifiedException();
        }

        // Check if user is active
        if (!user.getStatus().equals("active")) {
            throw new AuthException("Account is not active");
        }

        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails, user.getId());
        String refreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

        // Revoke old refresh tokens and save new one
        revokeAllUserRefreshTokens(user);
        saveRefreshToken(user, refreshToken);

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        // Validate refresh token
        if (!jwtService.validateToken(refreshToken)) {
            throw new TokenInvalidException("Invalid refresh token");
        }

        // Find token in database
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new TokenInvalidException("Refresh token not found"));

        // Check if token is revoked or expired
        if (token.isRevoked() || token.isExpired()) {
            throw new TokenExpiredException("Refresh token has expired or been revoked");
        }

        // Revoke old token
        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);

        // Get user
        User user = token.getUser();
        if (!user.getStatus().equals("active")) {
            throw new AuthException("Account is not active");
        }

        // Generate new tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtService.generateAccessToken(userDetails, user.getId());
        String newRefreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

        // Save new refresh token
        saveRefreshToken(user, newRefreshToken);

        return buildAuthResponse(newAccessToken, newRefreshToken, user);
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenInvalidException("Invalid verification token"));

        if (verificationToken.isUsed()) {
            throw new TokenInvalidException("Verification token already used");
        }

        if (verificationToken.isExpired()) {
            throw new TokenExpiredException("Verification token has expired");
        }

        // Mark token as used
        verificationToken.setUsedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(verificationToken);

        // Verify user email
        User user = verificationToken.getUser();
        user.setIsEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (user.getIsEmailVerified()) {
            throw new AuthException("Email already verified");
        }

        // Generate new OTP
        String otp = generateOTP();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(otp);
        verificationToken.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        emailVerificationTokenRepository.save(verificationToken);

        // TODO: Send verification email with OTP
        // emailService.sendVerificationEmail(user.getEmail(), otp);
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        // Generate reset token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);

        // TODO: Send password reset email with token
        // emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new TokenInvalidException("Invalid reset token"));

        if (resetToken.isUsed()) {
            throw new TokenInvalidException("Reset token already used");
        }

        if (resetToken.isExpired()) {
            throw new TokenExpiredException("Reset token has expired");
        }

        // Mark token as used
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        // Update password
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElse(null);

        if (token != null && !token.isRevoked()) {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    public UserDto getCurrentUser(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getProfile() != null ? user.getProfile().getFullName() : null)
                .phoneNumber(user.getProfile() != null ? user.getProfile().getPhoneNumber() : null)
                .avatarUrl(user.getProfile() != null ? user.getProfile().getAvatarUrl() : null)
                .isEmailVerified(user.getIsEmailVerified())
                .status(user.getStatus())
                .ratingPercent(user.getProfile() != null ? user.getProfile().getRatingPercent() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }

    // Helper method to save refresh token
    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshToken);
    }

    // Helper method to revoke all user refresh tokens
    private void revokeAllUserRefreshTokens(User user) {
        refreshTokenRepository.findByUserAndRevokedAtIsNull(user)
                .ifPresent(token -> {
                    token.setRevokedAt(LocalDateTime.now());
                    refreshTokenRepository.save(token);
                });
    }

    // Helper method to build auth response
    // Permissions are resolved server-side via PermissionService to keep JWT token size small
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
}

