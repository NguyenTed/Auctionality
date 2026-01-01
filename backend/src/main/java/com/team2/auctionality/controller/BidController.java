package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.*;
import com.team2.auctionality.mapper.RejectedBidderMapper;
import com.team2.auctionality.model.AutoBidConfig;
import com.team2.auctionality.model.RejectedBidder;
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
    @Operation(summary = "Place bid")
    public ResponseEntity<ApiResponse<AutoBidConfig>> placeBid(
            @PathVariable Integer productId,
            @RequestBody PlaceBidRequest bidRequest,
            @CurrentUser User user
    ) {

        AutoBidConfig bidConfig = bidService.placeBid(user, productId, bidRequest);

        URI location = URI.create("/api/bids/products/" + productId);

        return ResponseEntity
                .created(location)
                .body(new ApiResponse<>(
                        "Bid placed successfully",
                        bidConfig
                ));
    }

    @DeleteMapping("/products/{productId}/bidders/{bidderId}")
    @Operation(summary = "Reject a bidder from a product")
    public ResponseEntity<RejectedBidderDto> rejectBidder(
            @PathVariable Integer productId,
            @PathVariable Integer bidderId,
            @RequestBody(required = false) RejectBidderRequest request,
            @CurrentUser User user
    ) {
        log.info("User {} rejecting bidder {} from product {}", user.getId(), bidderId, productId);
        RejectedBidder rejectedBidder = bidService.rejectBidder(
                productId,
                bidderId,
                request != null ? request.getReason() : null
        );

        return ResponseEntity.ok(RejectedBidderMapper.toDto(rejectedBidder));
    }

    @GetMapping("/products/{productId}/bidder-approvals")
    @Operation(summary = "Get pending bidder approval requests for a product (seller only)")
    public ResponseEntity<List<com.team2.auctionality.dto.BidderApprovalDto>> getPendingBidderApprovals(
            @PathVariable Integer productId,
            @CurrentUser User user
    ) {
        // Service layer verifies seller ownership
        List<com.team2.auctionality.dto.BidderApprovalDto> approvals = bidService.getPendingBidderApprovals(user.getId())
                .stream()
                .filter(approval -> approval.getProductId().equals(productId))
                .toList();
        return ResponseEntity.ok(approvals);
    }

    @GetMapping("/bidder-approvals/pending")
    @Operation(summary = "Get all pending bidder approval requests for seller's products")
    public ResponseEntity<List<com.team2.auctionality.dto.BidderApprovalDto>> getAllPendingBidderApprovals(
            @CurrentUser User user
    ) {
        List<com.team2.auctionality.dto.BidderApprovalDto> approvals = bidService.getPendingBidderApprovals(user.getId());
        return ResponseEntity.ok(approvals);
    }

    @PostMapping("/bidder-approvals/{approvalId}/approve")
    @Operation(summary = "Approve a bidder approval request (seller only)")
    public ResponseEntity<Void> approveBidderApproval(
            @PathVariable Integer approvalId,
            @CurrentUser User user
    ) {
        bidService.approveBidderApproval(approvalId, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bidder-approvals/{approvalId}/reject")
    @Operation(summary = "Reject a bidder approval request (seller only)")
    public ResponseEntity<Void> rejectBidderApproval(
            @PathVariable Integer approvalId,
            @CurrentUser User user
    ) {
        bidService.rejectBidderApproval(approvalId, user.getId());
        return ResponseEntity.ok().build();
    }
}

