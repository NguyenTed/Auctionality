package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.RejectedBidderDto;
import com.team2.auctionality.model.RejectedBidder;
import org.springframework.stereotype.Component;

@Component
public class RejectedBidderMapper {

    public static RejectedBidderDto toDto(RejectedBidder rejectedBidder) {
        return RejectedBidderDto.builder()
                .id(rejectedBidder.getId())
                .productId(rejectedBidder.getProductId())
                .bidder(UserMapper.toDto(rejectedBidder.getBidder()))
                .reason(rejectedBidder.getReason())
                .createdAt(rejectedBidder.getCreatedAt())
                .build();
    }

}
