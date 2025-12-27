package com.team2.auctionality.dto;

import com.team2.auctionality.model.Bid;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AutoBidResult {
    private boolean priceChanged;
    private Bid generatedBid;
}
