package com.team2.auctionality.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Date;

@Getter
@Builder
public class BidHistoryDto {
    private String bidderName; //masked
    private float amount;
    private Date createdAt;
}
