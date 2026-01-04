package com.team2.auctionality.dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentDto {
    private Integer id;
    private Integer orderId;
    private String carrier;
    private String trackingNumber;
    private Date shippedAt;
    private Date deliveredAt;
}

