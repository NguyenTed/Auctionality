package com.team2.auctionality.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionEndedEmailRequest extends EmailRequest {
    private String productTitle;
    private String productUrl;
    private Float finalPrice;
    private String winnerName;
    private boolean hasWinner;

    public AuctionEndedEmailRequest(String toEmail, String productTitle, String productUrl, 
                                    Float finalPrice, String winnerName, boolean hasWinner) {
        super(toEmail, hasWinner 
            ? "Auction ended - Winner announced: " + productTitle
            : "Auction ended - No bids: " + productTitle);
        this.productTitle = productTitle;
        this.productUrl = productUrl;
        this.finalPrice = finalPrice;
        this.winnerName = winnerName;
        this.hasWinner = hasWinner;
    }
}

