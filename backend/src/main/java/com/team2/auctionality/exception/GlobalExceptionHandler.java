package com.team2.auctionality.exception;

import com.team2.auctionality.dto.ErrorResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Map<String, String>> handleAuthException(AuthException e) {
        log.error("AuthException: {}", e.getMessage(), e);
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage() != null ? e.getMessage() : "Authentication error occurred");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyExists(EmailAlreadyExistsException e) {
        log.warn("EmailAlreadyExistsException: {}", e.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage() != null ? e.getMessage() : "Email already exists");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(InvalidCredentialsException e) {
        log.warn("InvalidCredentialsException: {}", e.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage() != null ? e.getMessage() : "Invalid credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<Map<String, String>> handleTokenExpired(TokenExpiredException e) {
        log.warn("TokenExpiredException: {}", e.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage() != null ? e.getMessage() : "Token has expired");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(TokenInvalidException.class)
    public ResponseEntity<Map<String, String>> handleTokenInvalid(TokenInvalidException e) {
        log.warn("TokenInvalidException: {}", e.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage() != null ? e.getMessage() : "Invalid token");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UserNotFoundException e) {
        log.warn("UserNotFoundException: {}", e.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage() != null ? e.getMessage() : "User not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException e) {
        log.warn("BadCredentialsException: {}", e.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        log.error("RuntimeException: {}", e.getMessage(), e);
        Map<String, String> error = new HashMap<>();
        String message = e.getMessage();
        if (message == null || message.isEmpty()) {
            message = "An unexpected error occurred: " + e.getClass().getSimpleName();
        }
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException e) {
        log.warn("ValidationException: {}", e.getMessage());
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage != null ? errorMessage : "Invalid value");
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception e) {
        log.error("Unexpected exception: {}", e.getMessage(), e);
        Map<String, String> error = new HashMap<>();
        String message = e.getMessage();
        if (message == null || message.isEmpty()) {
            message = "An unexpected error occurred: " + e.getClass().getSimpleName();
        }
        error.put("error", "An unexpected error occurred");
        error.put("message", message);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.NOT_FOUND.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(WatchListAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleWatchListExists(WatchListAlreadyExistsException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.CONFLICT.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(BidNotAllowedException.class)
    public ResponseEntity<ErrorResponse> handleBidNotAllowed(BidNotAllowedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.FORBIDDEN.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(InvalidBidPriceException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPrice(InvalidBidPriceException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(AuctionClosedException.class)
    public ResponseEntity<ErrorResponse> handleAuctionClosed(AuctionClosedException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(BidPendingApprovalException.class)
    public ResponseEntity<ErrorResponse> handleBidPendingApproval(BidPendingApprovalException ex) {
        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.ACCEPTED.value(),
                        Instant.now()
                ));
    }
}

