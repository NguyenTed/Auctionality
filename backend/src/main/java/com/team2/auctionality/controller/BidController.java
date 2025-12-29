package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.*;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.mapper.RejectedBidderMapper;
import com.team2.auctionality.model.AutoBidConfig;
import com.team2.auctionality.model.BidderApproval;
import com.team2.auctionality.model.RejectedBidder;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.BidService;
import com.team2.auctionality.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.awt.print.Pageable;
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

    @PostMapping("/products/{productId}/bidders/{bidderId}")
    @Operation(summary = "Approve bidder")
    public ResponseEntity<Object> approveBidder(
            @PathVariable Integer productId,
            @PathVariable Integer bidderId,
            @CurrentUser User user
    ) {
        log.info("User {} approving bidder {} from product {}", user.getId(), bidderId, productId);
        bidService.approveBidder(
                productId,
                bidderId
        );

        URI location = URI.create("/api/bids/products/" + productId + "bidders/" + bidderId);

        return ResponseEntity
                .created(location)
                .body(new ApiResponse<>(
                        "Approve bidder " + bidderId + " from product " + productId + " successfully",
                        null
                ));
    }

    @GetMapping("/products/{productId}/biddera-approvals")
    @Operation(summary = "Get bidder approvals")
    public ResponseEntity<PagedResponse<BidderApproval>> getBidderApprovals(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @CurrentUser User user
    ) {
        PagedResponse response = PaginationMapper.from(bidService.getBidderApprovals(productId, PaginationUtils.createPageable(page, size) ));

        return ResponseEntity.ok(response);
    }
}

