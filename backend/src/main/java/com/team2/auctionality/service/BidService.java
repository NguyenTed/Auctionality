package com.team2.auctionality.service;

import com.team2.auctionality.auction.AutoBidEngine;
import com.team2.auctionality.dto.*;
import com.team2.auctionality.email.EmailService;
import com.team2.auctionality.email.dto.BidNotificationEmailRequest;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.exception.AuctionClosedException;
import com.team2.auctionality.exception.BidNotAllowedException;
import com.team2.auctionality.exception.BidPendingApprovalException;
import com.team2.auctionality.mapper.BidMapper;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.rabbitmq.BidEventPublisher;
import com.team2.auctionality.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // RabbitMQ
    private final BidEventPublisher bidEventPublisher;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;


    public List<BidHistoryDto> getBidHistory(Integer productId) {
        productService.getProductById(productId);

        // Filter out bids from rejected bidders
        return bidRepository.findValidBidsOrderByCreatedAtDesc(productId)
                .stream()
                .map(BidMapper::toDto)
                .toList();
    }

    @Transactional(noRollbackFor = BidPendingApprovalException.class)
    public AutoBidConfig placeBid(User bidder, Integer productId, PlaceBidRequest bidRequest) {
        // 1. Check if bidder is in RejectedBidder
        if (rejectedBidderRepository.existsByProductIdAndBidderId(productId, bidder.getId())) {
            log.warn("User " + bidder.getId() + " is rejected.");
            throw new BidNotAllowedException("You are not allowed to bid on this product");
        }

        UserProfile bidderProfile = bidder.getProfile();
        Product product = productService.getProductById(productId);
        Float ratingPercent = bidderProfile.getRatingPercent();
        LocalDateTime now = LocalDateTime.now();


        // 2. Check if product is ended
        if (product.getEndTime().isBefore(now) || product.getEndTime().isEqual(now)) {
            throw new AuctionClosedException("Auction has already ended");
        }

        ProductService.checkIsAmountAvailable(bidRequest.getAmount(), product.getBidIncrement(), product.getCurrentPrice());

        // 3. Operate if user rating percent is <= 80 --> create approval
        if (ratingPercent <= 80) {
            if (bidderProfile.getRatingNegativeCount() == 0 && bidderProfile.getRatingPositiveCount() == 0) {
                BidderApproval existedApproval = bidderApprovalRepository.findByProductIdAndBidderId(productId, bidder.getId()).orElse(null);
                if (existedApproval != null) {
                    // If pending -> throw exception, if APPROVED --> continue
                    if (existedApproval.getStatus() == ApproveStatus.PENDING) {
                        System.out.println(existedApproval);
                        System.out.println("Bid approval request has already been sent");
                        throw new BidPendingApprovalException("Your bid approval request has already been sent");
                    }
                } else {
                    BidderApproval bidderApproval = BidderApproval.builder()
                            .amount(bidRequest.getAmount())
                            .productId(productId)
                            .bidderId(bidder.getId())
                            .status(ApproveStatus.PENDING)
                            .createdAt(new Date())
                            .build();
                    bidderApprovalRepository.save(bidderApproval);
                    System.out.println("Created bidder approval for user " + bidder.getId() + " .");
                    throw new BidPendingApprovalException("Your bid approval before being placed");
                }
            } else {
                throw new BidNotAllowedException(
                        "Your rating does not meet the requirement to place bids"
                );
            }
        }

        // 4. Operate if placed bid is configured auto
        AutoBidConfig config = autoBidConfigRepository
                .findByProductIdAndBidderId(productId, bidder.getId())
                .orElse(null);

        if (config == null) {
            config = autoBidConfigRepository.save(
                    AutoBidConfig.builder()
                            .productId(productId)
                            .bidderId(bidder.getId())
                            .maxPrice(bidRequest.getAmount())
                            .createdAt(new Date())
                            .build()
            );
        } else {
            if (bidRequest.getAmount() < config.getMaxPrice()) {
                throw new IllegalArgumentException(
                        "Your max price is lower than the current auto-bid max price"
                );
            }
            // update max price
            config.setMaxPrice(bidRequest.getAmount());

        }
        AutoBidResult result = autoBidEngine.recalculate(product.getId());

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        List<BidHistoryDto> histories = getBidHistory(productId);
                        ProductDto productDto = ProductMapper.toDto(product);

                        bidEventPublisher.publishBidHistory(productId, histories);
                        // Send email notifications
//                        sendBidNotifications(finalProductForEmail, finalSavedBid);
                    }
                }
        );

        // 6. Save bid
//        Bid bid = Bid.builder()
//                .product(product)
//                .bidder(bidder)
//                .amount(bidRequest.getAmount())
//                .isAutoBid(true)
//                .build();
//
//        Bid savedBid = bidRepository.save(bid);
//
//        // 7. If product's endTime <= timeThreshold --> plus extension minutes.
//        systemAuctionRuleService.getActiveRule().ifPresent(rule -> {
//
//            long minutesToEnd = java.time.Duration
//                    .between(now, product.getEndTime())
//                    .toMinutes();
//
//            if (minutesToEnd <= rule.getTimeThresholdMinutes()) {
//                product.setEndTime(
//                        product.getEndTime().plusMinutes(rule.getExtensionMinutes())
//                );
//                productService.save(product);
//            }
//        });

        return config;
    }

    @Transactional
    public RejectedBidder rejectBidder(
            Integer productId,
            Integer bidderId,
            String reason,
            Integer sellerId
    ) {
        log.info("Seller {} rejecting bidder {} from product {}", sellerId, bidderId, productId);
        Product product = productService.getProductById(productId);
        
        // Verify seller ownership
        if (product.getSeller() == null || !product.getSeller().getId().equals(sellerId)) {
            throw new BidNotAllowedException("You are not authorized to reject bidders from this product");
        }
        
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

    @Transactional(readOnly = true)
    public Optional<AutoBidConfig> getAutoBidConfig(Integer productId, Integer userId) {
        return autoBidConfigRepository.findByProductIdAndBidderId(productId, userId);
    }

    /**
     * Send bid notifications to seller, new highest bidder, and previous highest bidder
     */
    private void sendBidNotifications(Product product, Bid savedBid) {
        String productUrl = frontendBaseUrl + "/products/" + product.getId();
        String bidderName = savedBid.getBidder().getProfile().getFullName();
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

    public Bid getHighestBidByProductId(Integer productId) {
        // Check if product has only one autobid config
        List<AutoBidConfig> autobidConfigs = autoBidConfigRepository.findByProductId(productId);
        
        if (autobidConfigs.size() == 1) {
            // Only one autobid config - that bidder is the highest bidder
            AutoBidConfig config = autobidConfigs.get(0);
            User bidder = userRepository.findById(config.getBidderId())
                    .orElseThrow(() -> new EntityNotFoundException("Bidder not found"));
            
            // Try to find existing bid from this bidder for this product
            List<Bid> bidsByBidder = bidRepository.findByProductIdOrderByCreatedAtDesc(productId)
                    .stream()
                    .filter(bid -> bid.getBidder().getId().equals(config.getBidderId()))
                    .sorted((b1, b2) -> Float.compare(b2.getAmount(), b1.getAmount()))
                    .toList();
            
            if (!bidsByBidder.isEmpty()) {
                // Return the highest bid from this bidder
                return bidsByBidder.get(0);
            }
            
            // No existing bid - create a representative Bid object
            // Use the product's current price as the bid amount
            Product product = productService.getProductById(productId);
            Float bidAmount = product.getCurrentPrice() != null 
                    ? product.getCurrentPrice() 
                    : product.getStartPrice();
            
            // Create a transient Bid object (not persisted) for representation
            Bid bid = new Bid();
            bid.setProduct(product);
            bid.setBidder(bidder);
            bid.setAmount(bidAmount);
            bid.setIsAutoBid(true);
            bid.setCreatedAt(new Date());
            
            return bid;
        }
        
        // If 2 or more autobid configs (or 0), use the existing logic
        return bidRepository.findHighestBid(productId).orElse(null);
    }
}
