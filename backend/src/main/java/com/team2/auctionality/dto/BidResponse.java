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
public class BidResponse {
    private Integer id;
    private Integer productId;
    private Integer bidderId;
    private Float amount;
    private Boolean isAutoBid;
    private Date createdAt;
    private AutoBidConfigDto autoBidConfig; // Optional, only if auto-bid was configured
}


