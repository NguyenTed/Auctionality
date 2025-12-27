package com.team2.auctionality.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RejectedBidderDto {
    private Integer id;
    private Integer productId;
    private UserDto bidder;
    private String reason;
    private Date createdAt;
}
