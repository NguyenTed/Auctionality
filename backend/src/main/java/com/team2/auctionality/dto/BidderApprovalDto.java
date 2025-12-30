package com.team2.auctionality.dto;

import com.team2.auctionality.enums.ApproveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidderApprovalDto {
    private Integer id;
    private Integer productId;
    private String productTitle;
    private Integer bidderId;
    private String bidderName;
    private String bidderEmail;
    private Float bidderRating;
    private Float amount;
    private ApproveStatus status;
    private Date createdAt;
}

