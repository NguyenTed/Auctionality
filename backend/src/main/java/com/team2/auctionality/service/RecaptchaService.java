package com.team2.auctionality.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service for validating Google reCAPTCHA tokens
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecaptchaService {

    @Value("${recaptcha.secret-key:}")
    private String secretKey;

    @Value("${recaptcha.verify-url:https://www.google.com/recaptcha/api/siteverify}")
    private String verifyUrl;

    @Value("${recaptcha.enabled:true}")
    private boolean enabled;

    /**
     * Verify reCAPTCHA token with Google's API
     * 
     * @param token The reCAPTCHA token from the client
     * @return true if token is valid, false otherwise
     */
    public boolean verifyToken(String token) {
        if (!enabled) {
            log.warn("reCAPTCHA validation is disabled");
            return true; // Skip validation if disabled (useful for development)
        }

        if (token == null || token.isBlank()) {
            log.warn("reCAPTCHA token is null or blank");
            return false;
        }

        // Allow dev-bypass token for development when reCAPTCHA is not configured
        if ("dev-bypass".equals(token) && (secretKey == null || secretKey.isBlank())) {
            log.warn("reCAPTCHA dev-bypass token used (reCAPTCHA not configured)");
            return true;
        }

        if (secretKey == null || secretKey.isBlank()) {
            log.error("reCAPTCHA secret key is not configured");
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret", secretKey);
            body.add("response", token);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    verifyUrl,
                    request,
                    Map.class
            );

            if (response == null) {
                log.warn("reCAPTCHA API returned null response");
                return false;
            }

            Boolean success = (Boolean) response.get("success");
            if (Boolean.TRUE.equals(success)) {
                log.debug("reCAPTCHA token verified successfully");
                return true;
            } else {
                log.warn("reCAPTCHA verification failed: {}", response.get("error-codes"));
                return false;
            }
        } catch (Exception e) {
            log.error("Error verifying reCAPTCHA token: {}", e.getMessage(), e);
            return false;
        }
    }
}

