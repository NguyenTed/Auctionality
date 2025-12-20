package com.team2.auctionality.service;

import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.PlaceBidRequest;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.exception.AuctionClosedException;
import com.team2.auctionality.exception.BidNotAllowedException;
import com.team2.auctionality.exception.BidPendingApprovalException;
import com.team2.auctionality.mapper.BidMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.AutoBidConfigRepository;
import com.team2.auctionality.repository.BidRepository;
import com.team2.auctionality.repository.BidderApprovalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    private final ProductService productService;
    private final SystemAuctionRuleService systemAuctionRuleService;


    public List<BidHistoryDto> getBidHistory(Integer productId) {

        productService.getProductById(productId);

        return bidRepository.findByProductId(productId)
                .stream()
                .map(BidMapper::toDto)
                .toList();
    }

    public Bid placeBid(User bidder, Integer productId, PlaceBidRequest bidRequest) {
        UserProfile bidderProfile = bidder.getProfile();
        Product product = productService.getProductById(productId);
        Float ratingPercent = bidderProfile.getRatingPercent();
        LocalDateTime now = LocalDateTime.now();

        if (product.getEndTime().isBefore(now) || product.getEndTime().isEqual(now)) {
            throw new AuctionClosedException("Auction has already ended");
        }

        ProductService.checkIsAmountAvailable(bidRequest.getAmount(), product.getBidIncrement(), product.getCurrentPrice());

        if (ratingPercent <= 80) {
            if (bidderProfile.getRatingNegativeCount() == 0 && bidderProfile.getRatingPositiveCount() == 0) {
                BidderApproval bidderApproval = BidderApproval.builder()
                        .amount(bidRequest.getAmount())
                        .bidderId(bidder.getId())
                        .status(ApproveStatus.PENDING)
                        .build();
                bidderApprovalRepository.save(bidderApproval);
                throw new BidPendingApprovalException("Your bid requires seller approval before being placed");
            } else {
                throw new BidNotAllowedException(
                        "Your rating does not meet the requirement to place bids"
                );
            }
        }

        Bid bid = Bid.builder()
                .product(product)
                .bidder(bidder)
                .amount(bidRequest.getAmount())
                .isAutoBid(bidRequest.getIsAutoBid())
                .build();

        Bid savedBid = bidRepository.save(bid);

        systemAuctionRuleService.getActiveRule().ifPresent(rule -> {

            long minutesToEnd = java.time.Duration
                    .between(now, product.getEndTime())
                    .toMinutes();

            if (minutesToEnd <= rule.getTimeThresholdMinutes()) {
                product.setEndTime(
                        product.getEndTime().plusMinutes(rule.getExtensionMinutes())
                );
                productService.save(product);
            }
        });

        return savedBid;
    }
}
