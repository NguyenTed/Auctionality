package com.team2.auctionality.controller;

import com.team2.auctionality.dto.ApiResponse;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.PlaceBidRequest;
import com.team2.auctionality.model.Bid;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.AuthService;
import com.team2.auctionality.service.BidService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/bids")
@Tag(name = "Bid", description = "Product API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BidController {

    private final BidService bidService;
    private final AuthService authService;

    @GetMapping()
    public ResponseEntity<List<BidHistoryDto>> getBidHistoryByProductId(
            @Parameter Integer productId) {
        return ResponseEntity.ok(
                bidService.getBidHistory(productId)
        );
    }

    @PostMapping("/place/{productId}")
    public ResponseEntity<ApiResponse<Bid>> placeBid(
            @PathVariable Integer productId,
            @RequestBody PlaceBidRequest bidRequest,
            Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        return bidService.placeBid(user, productId, bidRequest)
                .map(bid -> {
                    URI location = URI.create(
                            "/api/bids/place/" + productId
                    );

                    return ResponseEntity
                            .created(location)
                            .body(new ApiResponse<>(
                                    "Place bid with amount " + bidRequest.getAmount() + " successfully.",
                                    bid
                            ));
                }).orElse(null);
    }
}
