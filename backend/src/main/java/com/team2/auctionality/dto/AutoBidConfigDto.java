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
public class AutoBidConfigDto {
    private Integer id;
    private Integer productId;
    private Integer bidderId;
    private Float maxPrice;
    private Date createdAt;
}

