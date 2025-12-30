package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.model.Bid;
import org.springframework.stereotype.Component;

@Component
public class BidMapper {

    public static BidHistoryDto toDto(Bid bid){
        return BidHistoryDto.builder()
                .bidderName(maskName(bid.getBidder().getProfile() != null ? bid.getBidder().getProfile().getFullName() : "****"))
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .build();
    }

    private static String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "****";
        }

        String[] parts = fullName.trim().split("\\s+");

        if (parts.length == 1) {
            // Mask single-word names: show last 4 characters with asterisks
            String name = parts[0];
            if (name.length() <= 4) {
                return "****" + name;
            }
            return "****" + name.substring(name.length() - 4);
        }

        // For multiple words: mask all but the last word
        StringBuilder masked = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            masked.append("**** ");
        }
        masked.append(parts[parts.length - 1]);

        return masked.toString();
    }


}
