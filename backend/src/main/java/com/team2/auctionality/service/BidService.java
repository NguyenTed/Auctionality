package com.team2.auctionality.service;

import com.team2.auctionality.auction.AutoBidEngine;
import com.team2.auctionality.dto.AutoBidResult;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.PlaceBidRequest;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.exception.AuctionClosedException;
import com.team2.auctionality.exception.BidNotAllowedException;
import com.team2.auctionality.exception.BidPendingApprovalException;
import com.team2.auctionality.mapper.BidMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final AutoBidConfigRepository autoBidConfigRepository;
    private final BidderApprovalRepository bidderApprovalRepository;
    private final RejectedBidderRepository rejectedBidderRepository;
    private final ProductService productService;
    private final AutoBidEngine autoBidEngine;



    public List<BidHistoryDto> getBidHistory(Integer productId) {

        productService.getProductById(productId);

        return bidRepository.findByProductId(productId)
                .stream()
                .map(BidMapper::toDto)
                .toList();
    }

    @Transactional(noRollbackFor = BidPendingApprovalException.class)
    public AutoBidConfig placeBid(User bidder, Integer productId, PlaceBidRequest bidRequest) {

        // 1. Check if bidder is in RejectedBidder
        if (rejectedBidderRepository.existsByProductIdAndBidderId(productId, bidder.getId())) {
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
//        if (ratingPercent <= 80) {
//            if (bidderProfile.getRatingNegativeCount() == 0 && bidderProfile.getRatingPositiveCount() == 0) {
//                if (bidderApprovalRepository.findByProductIdAndBidderId(productId, bidder.getId()).isPresent()) {
//                    throw new BidPendingApprovalException("Your bid requires seller approval request has already been sent");
//                }
//                BidderApproval bidderApproval = BidderApproval.builder()
//                        .amount(bidRequest.getAmount())
//                        .productId(productId)
//                        .bidderId(bidder.getId())
//                        .status(ApproveStatus.PENDING)
//                        .createdAt(new Date())
//                        .build();
//                bidderApprovalRepository.save(bidderApproval);
//                throw new BidPendingApprovalException("Your bid requires seller approval before being placed");
//            } else {
//                throw new BidNotAllowedException(
//                        "Your rating does not meet the requirement to place bids"
//                );
//            }
//        }

        // 4. Operate if placed bid is configured auto
        AutoBidConfig config = autoBidConfigRepository
                .findByProductIdAndBidderId(productId, bidder.getId())
                .orElse(null);

        if (config == null) {
            autoBidConfigRepository.save(
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
}
