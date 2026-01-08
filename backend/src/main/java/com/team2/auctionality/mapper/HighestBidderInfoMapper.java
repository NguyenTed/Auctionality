package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.HighestBidderInfoDto;
import com.team2.auctionality.model.Bid;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class HighestBidderInfoMapper {

    public static HighestBidderInfoDto toDto(Bid highestBid) {
        if (highestBid == null || highestBid.getBidder() == null) return null;

        User bidder = highestBid.getBidder();
        UserProfile profile = bidder.getProfile();
        String fullName = profile != null ? profile.getFullName() : null;

        return HighestBidderInfoDto.builder()
                .id(bidder.getId())
                .maskedName(maskName(fullName))
                .ratingPercent(profile != null ? profile.getRatingPercent() : null)
                .bidAmount(highestBid.getAmount())
                .build();
    }

    private static String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "****";
        }

        String[] parts = fullName.trim().split("\\s+");

        if (parts.length == 1) {
            return parts[0];
        }

        StringBuilder masked = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            masked.append("**** ");
        }
        masked.append(parts[parts.length - 1]);

        return masked.toString();
    }
}

