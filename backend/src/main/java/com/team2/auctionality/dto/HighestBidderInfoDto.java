package com.team2.auctionality.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for highest bidder information in product responses
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HighestBidderInfoDto {
    private Integer id;
    private String maskedName; // e.g., "****John"
    private Float ratingPercent;
    private Float bidAmount;
}

