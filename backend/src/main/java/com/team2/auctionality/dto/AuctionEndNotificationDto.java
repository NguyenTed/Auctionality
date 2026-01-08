package com.team2.auctionality.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionEndNotificationDto {
    private Integer productId;
    private Integer orderId;
    private Integer buyerId;
    private Integer sellerId;
    private Float finalPrice;
    private String message;
}

