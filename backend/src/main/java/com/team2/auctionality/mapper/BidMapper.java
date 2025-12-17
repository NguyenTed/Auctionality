package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.model.Bid;
import org.springframework.stereotype.Component;

@Component
public class BidMapper {

    public static BidHistoryDto toDto(Bid bid){
        return BidHistoryDto.builder()
                .bidderName(maskName(bid.getBidder().getProfile().getFullName()))
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .build();
    }

    private static String maskName(String fullName) {
        if (fullName == null || fullName.length() <= 1) {
            return "****";
        }
        return "****" + fullName.substring(fullName.length() - 1);
    }

}
