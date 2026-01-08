package com.team2.auctionality.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductPriceUpdatedEvent {
    private Integer productId;
    private Float newPrice;
    private Float previousPrice;
}
