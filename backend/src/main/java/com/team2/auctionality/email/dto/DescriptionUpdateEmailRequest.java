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
public class DescriptionUpdateEmailRequest extends EmailRequest {
    
    public DescriptionUpdateEmailRequest(String toEmail, String productTitle, String productUrl, String bidderName) {
        super(toEmail, "Product description updated: " + productTitle);
        this.productTitle = productTitle;
        this.productUrl = productUrl;
        this.bidderName = bidderName;
    }

    private String productTitle;
    private String productUrl;
    private String bidderName;
}
