package com.team2.auctionality.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Date;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BidHistoryDto {
    private Integer bidderId; // For seller to reject bidders
    private String bidderName; //masked
    private float amount;
    private Date createdAt;
}
