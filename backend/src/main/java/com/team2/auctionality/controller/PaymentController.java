package com.team2.auctionality.controller;

import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.PaymentRepository;
import com.team2.auctionality.service.AuthService;
import com.team2.auctionality.service.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment", description = "Payment API")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentService paymentService;
    private final AuthService authService;

    @GetMapping("/vnpay-return")
    public ResponseEntity<String> handleVnPayReturn(HttpServletRequest request) {
        paymentService. processVnPayReturn(request);
        return ResponseEntity.ok("Payment processed");
    }

    @GetMapping("/{productId}/vnpay-url")
    public ResponseEntity<String> getPaymentUrl(
            @PathVariable Integer productId,
            Authentication authentication,
            HttpServletRequest request
    ) throws UnsupportedEncodingException {
        User user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(
                paymentService.getPaymentUrl(user, productId, request)
        );
    }
}
