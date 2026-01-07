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
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException e) {

        Map<String, String> errors = new LinkedHashMap<>();

        e.getBindingResult().getAllErrors().forEach(error -> {

            String errorMessage = error.getDefaultMessage() != null
                    ? error.getDefaultMessage()
                    : "Invalid value";

            if (error instanceof FieldError fieldError) {
                // field-level validation
                String fieldName = fieldError.getField();
                errors.put(fieldName, fieldName + " " + errorMessage);
            } else {
                // object-level validation (@Valid on class)
                String objectName = error.getObjectName();
                errors.put(objectName, objectName + " " + errorMessage);
            }
        });

        ErrorResponse response = new ErrorResponse(
                errors,
                HttpStatus.BAD_REQUEST.value(),
                Instant.now()
        );

        return ResponseEntity.badRequest().body(response);
    }


    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthException(AuthException e) {
        log.error("AuthException: {}", e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        e.getMessage() != null ? e.getMessage() : "Authentication error occurred",
                        HttpStatus.BAD_REQUEST.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException e) {
        log.warn("EmailAlreadyExistsException: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        e.getMessage() != null ? e.getMessage() : "Email already exists",
                        HttpStatus.CONFLICT.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException e) {
        log.warn("InvalidCredentialsException: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        e.getMessage() != null ? e.getMessage() : "Invalid credentials",
                        HttpStatus.UNAUTHORIZED.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotVerified(EmailNotVerifiedException e) {
        log.warn("EmailNotVerifiedException: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        e.getMessage() != null ? e.getMessage() : "Email not verified",
                        HttpStatus.FORBIDDEN.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ErrorResponse> handleTokenExpired(TokenExpiredException e) {
        log.warn("TokenExpiredException: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        e.getMessage() != null ? e.getMessage() : "Token has expired",
                        HttpStatus.UNAUTHORIZED.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(TokenInvalidException.class)
    public ResponseEntity<ErrorResponse> handleTokenInvalid(TokenInvalidException e) {
        log.warn("TokenInvalidException: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        e.getMessage() != null ? e.getMessage() : "Invalid token",
                        HttpStatus.BAD_REQUEST.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException e) {
        log.warn("UserNotFoundException: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        e.getMessage() != null ? e.getMessage() : "User not found",
                        HttpStatus.NOT_FOUND.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException e) {
        log.warn("BadCredentialsException: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        "Invalid email or password",
                        HttpStatus.UNAUTHORIZED.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e) {
        log.error("RuntimeException: {}", e.getMessage(), e);
        String message = e.getMessage();
        if (message == null || message.isEmpty()) {
            message = "An unexpected error occurred: " + e.getClass().getSimpleName();
        }
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        message,
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        log.error("Unexpected exception: {}", e.getMessage(), e);
        String message = e.getMessage();
        if (message == null || message.isEmpty()) {
            message = "An unexpected error occurred: " + e.getClass().getSimpleName();
        }
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        "An unexpected error occurred",
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        Instant.now()
                ));
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

    @ExceptionHandler(RatingException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRating(RatingException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(SellerUpgradeBadRequestException.class)
    public ResponseEntity<ErrorResponse> handleExistSellerUpgradeRequest(SellerUpgradeBadRequestException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(CancelOrderBadRequestException.class)
    public ResponseEntity<ErrorResponse> handleCancelOrderBadRequest(CancelOrderBadRequestException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value(),
                        Instant.now()
                ));
    }
}

