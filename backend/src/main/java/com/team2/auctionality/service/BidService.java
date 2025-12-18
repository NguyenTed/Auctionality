package com.team2.auctionality.service;

import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.PlaceBidRequest;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.exception.BidNotAllowedException;
import com.team2.auctionality.exception.BidPendingApprovalException;
import com.team2.auctionality.mapper.BidMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.AutoBidConfigRepository;
import com.team2.auctionality.repository.BidRepository;
import com.team2.auctionality.repository.BidderApprovalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final AutoBidConfigRepository autoBidConfigRepository;
    private final BidderApprovalRepository bidderApprovalRepository;
    private final ProductService productService;

    public List<BidHistoryDto> getBidHistory(Integer productId) {

        productService.getProductById(productId);

        return bidRepository.findByProductId(productId)
                .stream()
                .map(BidMapper::toDto)
                .toList();
    }

    public Optional<Bid> placeBid(User bidder, Integer productId, PlaceBidRequest bidRequest) {
        UserProfile bidderProfile = bidder.getProfile();
        Product product = productService.getProductById(productId);
        Float ratingPercent = bidderProfile.getRatingPercent();

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
                throw new BidNotAllowedException(String.format(
                        "User %d is not allowed",
                        bidder.getId()
                ));
            }
        }

        Bid bid = Bid.builder()
                .product(product)
                .bidder(bidder)
                .amount(bidRequest.getAmount())
                .isAutoBid(bidRequest.getIsAutoBid())
                .build();

        return Optional.of(bidRepository.save(bid));
    }
}
