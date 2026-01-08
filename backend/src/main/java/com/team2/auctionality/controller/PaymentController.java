package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment", description = "Payment API")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/vnpay-return")
    @Operation(summary = "Handle VNPay payment return callback")
    public ResponseEntity<String> handleVnPayReturn(HttpServletRequest request) {
        log.info("Processing VNPay return callback");
        paymentService.processVnPayReturn(request);
        return ResponseEntity.ok("Payment processed successfully");
    }

    @GetMapping("/{productId}/vnpay-url")
    @Operation(summary = "Get VNPay payment URL for a product")
    public ResponseEntity<String> getPaymentUrl(
            @PathVariable Integer productId,
            @CurrentUser User user,
            HttpServletRequest request
    ) throws UnsupportedEncodingException {
        log.info("User {} requesting payment URL for product {}", user.getId(), productId);
        return ResponseEntity.ok(
                paymentService.getPaymentUrl(user, productId, request)
        );
    }
}
