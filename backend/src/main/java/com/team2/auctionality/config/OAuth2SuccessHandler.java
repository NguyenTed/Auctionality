package com.team2.auctionality.config;

import com.team2.auctionality.dto.AuthResponse;
import com.team2.auctionality.service.OAuth2Service;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Handles successful OAuth2 authentication
 * Redirects to frontend with tokens in URL parameters or sets cookies
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2Service oAuth2Service;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        log.info("OAuth2 authentication successful for user: {}", authentication.getName());

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String provider = determineProvider(request);
            
            // Process OAuth2 login and get auth response
            AuthResponse authResponse = oAuth2Service.processOAuth2Login(oAuth2User, provider);

            // Set cookies with tokens
            setTokenCookies(response, authResponse.getAccessToken(), authResponse.getRefreshToken());

            // Build redirect URL with tokens (for frontend to extract)
            // Encode tokens for URL safety
            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendBaseUrl + "/auth/oauth2/callback")
                    .queryParam("accessToken", URLEncoder.encode(authResponse.getAccessToken(), StandardCharsets.UTF_8))
                    .queryParam("refreshToken", URLEncoder.encode(authResponse.getRefreshToken(), StandardCharsets.UTF_8))
                    .queryParam("success", "true")
                    .build()
                    .toUriString();

            log.info("Redirecting to frontend: {}", redirectUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } catch (Exception e) {
            log.error("Error processing OAuth2 login: {}", e.getMessage(), e);
            String errorUrl = UriComponentsBuilder
                    .fromUriString(frontendBaseUrl + "/auth/oauth2/callback")
                    .queryParam("success", "false")
                    .queryParam("error", URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8))
                    .build()
                    .toUriString();
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }

    private String determineProvider(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        if (requestURI.contains("/oauth2/authorization/google")) {
            return "google";
        }
        // Default to google if not specified
        return "google";
    }

    private void setTokenCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        if (accessToken != null && !accessToken.isBlank()) {
            Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
            accessTokenCookie.setHttpOnly(true);
            accessTokenCookie.setPath("/");
            accessTokenCookie.setMaxAge(60 * 60); // 1 hour
            response.addCookie(accessTokenCookie);
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(refreshTokenCookie);
        }
    }
}

