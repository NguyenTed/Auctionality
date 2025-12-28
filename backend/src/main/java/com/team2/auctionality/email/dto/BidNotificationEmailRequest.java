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
public class BidNotificationEmailRequest extends EmailRequest {
    
    public BidNotificationEmailRequest(String toEmail, String productTitle, String productUrl, 
                                       Float bidAmount, String bidderName, NotificationType type) {
        super(toEmail, getSubjectForType(type, productTitle));
        this.productTitle = productTitle;
        this.productUrl = productUrl;
        this.bidAmount = bidAmount;
        this.bidderName = bidderName;
        this.type = type;
    }
    public enum NotificationType {
        SELLER,
        NEW_HIGHEST_BIDDER,
        PREVIOUS_BIDDER
    }

    private String productTitle;
    private String productUrl;
    private Float bidAmount;
    private String bidderName;
    private NotificationType type;

    private static String getSubjectForType(NotificationType type, String productTitle) {
        return switch (type) {
            case SELLER -> "New bid on your auction: " + productTitle;
            case NEW_HIGHEST_BIDDER -> "Congratulations! You're the highest bidder on: " + productTitle;
            case PREVIOUS_BIDDER -> "You've been outbid on: " + productTitle;
        };
    }
}

