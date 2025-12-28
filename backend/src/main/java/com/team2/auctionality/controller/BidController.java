package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.BidResponse;
import com.team2.auctionality.dto.PlaceBidRequest;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.BidService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/bids")
@Tag(name = "Bid", description = "Bid API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class BidController {

    private final BidService bidService;
    private final com.team2.auctionality.sse.SseEmitterManager emitterManager;

    @GetMapping("/products/{productId}/history")
    @Operation(summary = "Subscribe to bid history updates via SSE")
    public SseEmitter subscribeBidHistory(@PathVariable Integer productId) {
        SseEmitter emitter = emitterManager.subscribe(productId);

        try {
            List<BidHistoryDto> histories = bidService.getBidHistory(productId);
            emitter.send(
                    SseEmitter.event()
                            .name("bid-history")
                            .data(histories)
            );
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
        return emitter;
    }

    @GetMapping("/products/{productId}/history/sync")
    @Operation(summary = "Get bid history synchronously")
    public ResponseEntity<List<BidHistoryDto>> getBidHistory(@PathVariable Integer productId) {
        List<BidHistoryDto> histories = bidService.getBidHistory(productId);
        return ResponseEntity.ok(histories);
    }

    @PostMapping("/products/{productId}")
    @Operation(summary = "Place a bid on a product")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable Integer productId,
            @Valid @RequestBody PlaceBidRequest bidRequest,
            @CurrentUser User user
    ) {
        log.info("User {} placing bid {} on product {}", user.getId(), bidRequest.getAmount(), productId);
        BidResponse bidResponse = bidService.placeBid(user, productId, bidRequest);
        URI location = URI.create("/api/bids/products/" + productId + "/history");
        return ResponseEntity
                .created(location)
                .body(bidResponse);
    }
}

