package com.team2.auctionality.service;

import com.team2.auctionality.auction.AutoBidEngine;
import com.team2.auctionality.dto.AutoBidConfigDto;
import com.team2.auctionality.dto.AutoBidResult;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.BidResponse;
import com.team2.auctionality.dto.PlaceBidRequest;
import com.team2.auctionality.email.EmailService;
import com.team2.auctionality.email.dto.BidNotificationEmailRequest;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.exception.AuctionClosedException;
import com.team2.auctionality.exception.BidNotAllowedException;
import com.team2.auctionality.exception.BidPendingApprovalException;
import com.team2.auctionality.mapper.BidMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.rabbitmq.BidEventPublisher;
import com.team2.auctionality.repository.*;
import com.team2.auctionality.validation.BidAmountValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BidService {

    private final BidRepository bidRepository;
    private final AutoBidConfigRepository autoBidConfigRepository;
    private final BidderApprovalRepository bidderApprovalRepository;
    private final RejectedBidderRepository rejectedBidderRepository;
    private final ProductService productService;
    private final AutoBidEngine autoBidEngine;
    private final SystemAuctionRuleService systemAuctionRuleService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BidAmountValidator bidAmountValidator;

    // RabbitMQ
    private final BidEventPublisher bidEventPublisher;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;



    @Transactional(readOnly = true)
    public List<BidHistoryDto> getBidHistory(Integer productId) {
        productService.getProductById(productId);

        return bidRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(BidMapper::toDto)
                .toList();
    }

    /**
     * Configure auto-bid for a product
     * This system ONLY supports auto-bid (not manual bidding)
     * The amount in the request represents the maximum price the bidder is willing to pay
     *
     * @param bidder    The user configuring auto-bid
     * @param productId The product ID
     * @param bidRequest Contains the maximum price for auto-bid
     * @return BidResponse with auto-bid configuration and any generated bid
     */
    @Transactional
    public BidResponse placeBid(User bidder, Integer productId, PlaceBidRequest bidRequest) {
        log.info("User {} configuring auto-bid with max price {} on product {}", 
                bidder.getId(), bidRequest.getAmount(), productId);

        // 1. Check if bidder is rejected from this product
        if (rejectedBidderRepository.existsByProductIdAndBidderId(productId, bidder.getId())) {
            log.warn("Bidder {} is rejected from product {}", bidder.getId(), productId);
            throw new BidNotAllowedException("You are not allowed to bid on this product");
        }

        Product product = productService.getProductById(productId);
        final LocalDateTime now = LocalDateTime.now();

        // 2. Check if product auction has ended
        if (product.getEndTime().isBefore(now) || product.getEndTime().isEqual(now)) {
            throw new AuctionClosedException("Auction has already ended");
        }

        // 3. Check bidder rating - must be ≥ 80% OR new bidder (no rating) requires seller approval
        // OR bidder has an approved bidder approval request
        UserProfile bidderProfile = bidder.getProfile();
        Float ratingPercent = bidderProfile != null ? bidderProfile.getRatingPercent() : 0.0f;
        boolean isNewBidder = (bidderProfile == null || 
                              (bidderProfile.getRatingPositiveCount() == 0 && 
                               bidderProfile.getRatingNegativeCount() == 0));

        // Check if there's an approved bidder approval request
        Optional<BidderApproval> approvalOpt = bidderApprovalRepository.findByProductIdAndBidderId(productId, bidder.getId());
        boolean hasApprovedRequest = approvalOpt.isPresent() && 
                                    approvalOpt.get().getStatus() == ApproveStatus.APPROVED &&
                                    approvalOpt.get().getAmount().equals(bidRequest.getAmount());

        if (ratingPercent < 80.0f && !hasApprovedRequest) {
            if (isNewBidder) {
                // New bidder - create approval request
                if (approvalOpt.isPresent() && approvalOpt.get().getStatus() == ApproveStatus.PENDING) {
                    throw new BidPendingApprovalException("Your bid requires seller approval. Request has already been sent.");
                }
                
                if (!approvalOpt.isPresent()) {
                    BidderApproval bidderApproval = BidderApproval.builder()
                            .amount(bidRequest.getAmount())
                            .productId(productId)
                            .bidderId(bidder.getId())
                            .status(ApproveStatus.PENDING)
                            .createdAt(new Date())
                            .build();
                    bidderApprovalRepository.save(bidderApproval);
                }
                throw new BidPendingApprovalException("Your bid requires seller approval before being placed. Please wait for approval.");
            } else {
                // Existing bidder with low rating
                throw new BidNotAllowedException(
                        "Your rating (" + ratingPercent + "%) does not meet the requirement (≥80%) to place bids"
                );
            }
        }

        // 4. Validate that max price is valid (must be >= current price + increment)
        Float minRequiredPrice = (product.getCurrentPrice() != null && product.getCurrentPrice() > 0) 
                ? product.getCurrentPrice() + product.getBidIncrement()
                : product.getStartPrice() + product.getBidIncrement();
        
        if (bidRequest.getAmount() < minRequiredPrice) {
            throw new IllegalArgumentException(
                    String.format("Maximum price must be at least %s (current price + increment)", minRequiredPrice)
            );
        }

        // 5. Create or update auto-bid configuration
        AutoBidConfig config = autoBidConfigRepository
                .findByProductIdAndBidderId(productId, bidder.getId())
                .orElse(null);

        if (config == null) {
            // Create new auto-bid configuration
            config = autoBidConfigRepository.save(
                    AutoBidConfig.builder()
                            .productId(productId)
                            .bidderId(bidder.getId())
                            .maxPrice(bidRequest.getAmount())
                            .createdAt(new Date())
                            .build()
            );
            log.info("Created new auto-bid config for user {} on product {} with max price {}", 
                    bidder.getId(), productId, bidRequest.getAmount());
        } else {
            // Update existing auto-bid configuration
            if (bidRequest.getAmount() < config.getMaxPrice()) {
                throw new IllegalArgumentException(
                        "Your max price is lower than the current auto-bid max price. " +
                        "To lower your max price, you must cancel and reconfigure."
                );
            }
            config.setMaxPrice(bidRequest.getAmount());
            autoBidConfigRepository.save(config);
            log.info("Updated auto-bid config for user {} on product {} with new max price {}", 
                    bidder.getId(), productId, bidRequest.getAmount());
        }

        // 6. Recalculate auto-bid engine (this will create a bid if auto-bid triggers)
        AutoBidResult autoBidResult = autoBidEngine.recalculate(product.getId());
        
        // Refresh product to get updated price
        product = productService.getProductById(productId);
        
        // 7. Get the bid that was created (if any)
        Bid savedBid = autoBidResult.getGeneratedBid();
        
        // If no bid was generated yet (max price not reached), we still return success
        // The auto-bid will trigger when another bidder places a bid

        // 7. Check if product's endTime <= timeThreshold --> plus extension minutes
        final Product finalProduct = product; // Make final for lambda
        systemAuctionRuleService.getActiveRule().ifPresent(rule -> {
            long minutesToEnd = java.time.Duration
                    .between(now, finalProduct.getEndTime())
                    .toMinutes();

            if (minutesToEnd <= rule.getTimeThresholdMinutes()) {
                finalProduct.setEndTime(
                        finalProduct.getEndTime().plusMinutes(rule.getExtensionMinutes())
                );
                productService.save(finalProduct);
            }
        });

        // 9. Publish events and send email notifications after transaction commits
        final Integer finalProductId = productId; // Make final for lambda
        final Bid finalSavedBid = savedBid; // Make final for lambda
        final Product finalProductForEmail = product; // Make final for lambda
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        // Refresh product to get latest state
                        List<BidHistoryDto> histories = getBidHistory(finalProductId);
                        bidEventPublisher.publishBidHistory(finalProductId, histories);

                        // Send email notifications
                        sendBidNotifications(finalProductForEmail, finalSavedBid);
                    }
                }
        );

        // 10. Build response
        AutoBidConfigDto configDto = AutoBidConfigDto.builder()
                .id(config.getId())
                .productId(config.getProductId())
                .bidderId(config.getBidderId())
                .maxPrice(config.getMaxPrice())
                .createdAt(config.getCreatedAt())
                .build();

        return BidResponse.builder()
                .id(savedBid != null ? savedBid.getId() : null)
                .productId(productId)
                .bidderId(bidder.getId())
                .amount(savedBid != null ? savedBid.getAmount() : product.getCurrentPrice())
                .isAutoBid(true) // All bids are auto-bid in this system
                .createdAt(savedBid != null ? savedBid.getCreatedAt() : new Date())
                .autoBidConfig(configDto)
                .build();
    }

    @Transactional
    public RejectedBidder rejectBidder(
            Integer productId,
            Integer bidderId,
            String reason
    ) {
        log.info("Rejecting bidder {} from product {}", bidderId, productId);
        Product product = productService.getProductById(productId);
        User bidder = userRepository.findById(bidderId)
                .orElseThrow(() -> new EntityNotFoundException("Bidder not found"));

        // Set reject status if bidder approval was sent
        bidderApprovalRepository
                .findByProductIdAndBidderId(productId, bidderId)
                .ifPresent(approval -> {
                    approval.setStatus(ApproveStatus.REJECTED);
                    bidderApprovalRepository.save(approval);
                });

        RejectedBidder rejectedBidder = rejectedBidderRepository
                .findByProductIdAndBidderId(productId, bidderId)
                .orElseGet(() -> rejectedBidderRepository.save(
                        RejectedBidder.builder()
                                .productId(productId)
                                .bidder(bidder)
                                .reason(reason)
                                .createdAt(new Date())
                                .build()
                ));

        // Set to the next if rejected bidder is who is having the highest price
        Optional<Bid> currentTopBidOpt = bidRepository.findTopBidByProductId(productId);

        if (currentTopBidOpt.isPresent()
                && currentTopBidOpt.get().getBidder().getId().equals(bidderId)) {

            List<Bid> validBids = bidRepository.findValidBids(productId);

            if (!validBids.isEmpty()) {
                Bid nextBid = validBids.getFirst();
                product.setCurrentPrice(nextBid.getAmount());
            } else {
                product.setCurrentPrice(product.getStartPrice());
            }
            productService.save(product);
        }

        // Send rejection email notification
        String productUrl = frontendBaseUrl + "/products/" + productId;
        emailService.sendBidderRejectedNotification(
                bidder.getEmail(),
                product.getTitle(),
                reason,
                productUrl
        );

        return rejectedBidder;
    }

    @Transactional(readOnly = true)
    public List<com.team2.auctionality.dto.BidderApprovalDto> getPendingBidderApprovals(Integer sellerId) {
        log.debug("Getting pending bidder approvals for seller: {}", sellerId);
        return bidderApprovalRepository.findPendingBySellerId(sellerId)
                .stream()
                .map(approval -> {
                    Product product = productService.getProductById(approval.getProductId());
                    User bidder = userRepository.findById(approval.getBidderId())
                            .orElseThrow(() -> new EntityNotFoundException("Bidder not found"));
                    UserProfile bidderProfile = bidder.getProfile();
                    
                    return com.team2.auctionality.dto.BidderApprovalDto.builder()
                            .id(approval.getId())
                            .productId(approval.getProductId())
                            .productTitle(product.getTitle())
                            .bidderId(approval.getBidderId())
                            .bidderName(bidderProfile != null ? bidderProfile.getFullName() : "Unknown")
                            .bidderEmail(bidder.getEmail())
                            .bidderRating(bidderProfile != null ? bidderProfile.getRatingPercent() : 0.0f)
                            .amount(approval.getAmount())
                            .status(approval.getStatus())
                            .createdAt(approval.getCreatedAt())
                            .build();
                })
                .toList();
    }

    @Transactional
    public void approveBidderApproval(Integer approvalId, Integer sellerId) {
        log.info("Seller {} approving bidder approval request: {}", sellerId, approvalId);
        BidderApproval approval = bidderApprovalRepository.findById(approvalId)
                .orElseThrow(() -> new EntityNotFoundException("Bidder approval request not found"));
        
        Product product = productService.getProductById(approval.getProductId());
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new BidNotAllowedException("You are not authorized to approve this request");
        }
        
        if (approval.getStatus() != ApproveStatus.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }
        
        approval.setStatus(ApproveStatus.APPROVED);
        bidderApprovalRepository.save(approval);
        
        // Now trigger the auto-bid with the approved amount
        User bidder = userRepository.findById(approval.getBidderId())
                .orElseThrow(() -> new EntityNotFoundException("Bidder not found"));
        
        PlaceBidRequest bidRequest = new PlaceBidRequest();
        bidRequest.setAmount(approval.getAmount());
        
        // Place the bid (this will now pass the rating check since it's approved)
        placeBid(bidder, approval.getProductId(), bidRequest);
    }

    @Transactional
    public void rejectBidderApproval(Integer approvalId, Integer sellerId) {
        log.info("Seller {} rejecting bidder approval request: {}", sellerId, approvalId);
        BidderApproval approval = bidderApprovalRepository.findById(approvalId)
                .orElseThrow(() -> new EntityNotFoundException("Bidder approval request not found"));
        
        Product product = productService.getProductById(approval.getProductId());
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new BidNotAllowedException("You are not authorized to reject this request");
        }
        
        if (approval.getStatus() != ApproveStatus.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }
        
        approval.setStatus(ApproveStatus.REJECTED);
        bidderApprovalRepository.save(approval);
    }

    /**
     * Send bid notifications to seller, new highest bidder, and previous highest bidder
     */
    private void sendBidNotifications(Product product, Bid savedBid) {
        if (savedBid == null || savedBid.getBidder() == null) {
            log.warn("Cannot send bid notifications: bid or bidder is null");
            return;
        }

        String productUrl = frontendBaseUrl + "/products/" + product.getId();
        String bidderName = savedBid.getBidder().getProfile() != null 
                ? savedBid.getBidder().getProfile().getFullName() 
                : savedBid.getBidder().getEmail();
        Float bidAmount = savedBid.getAmount();

        // 1. Notify seller
        emailService.sendBidSuccessNotification(
                new BidNotificationEmailRequest(
                        product.getSeller().getEmail(),
                        product.getTitle(),
                        productUrl,
                        bidAmount,
                        bidderName,
                        BidNotificationEmailRequest.NotificationType.SELLER
                )
        );

        // 2. Notify new highest bidder (the one who just placed the bid)
        emailService.sendBidSuccessNotification(
                new BidNotificationEmailRequest(
                        savedBid.getBidder().getEmail(),
                        product.getTitle(),
                        productUrl,
                        bidAmount,
                        bidderName,
                        BidNotificationEmailRequest.NotificationType.NEW_HIGHEST_BIDDER
                )
        );

        // 3. Find and notify previous highest bidder (if exists and different from current)
        bidRepository.findTopBidByProductId(product.getId())
                .filter(bid -> !bid.getId().equals(savedBid.getId()))
                .ifPresent(previousBid -> {
                    User previousBidder = previousBid.getBidder();
                    if (!previousBidder.getId().equals(savedBid.getBidder().getId())) {
                        emailService.sendBidSuccessNotification(
                                new BidNotificationEmailRequest(
                                        previousBidder.getEmail(),
                                        product.getTitle(),
                                        productUrl,
                                        bidAmount,
                                        bidderName,
                                        BidNotificationEmailRequest.NotificationType.PREVIOUS_BIDDER
                                )
                        );
                    }
                });
    }
}
