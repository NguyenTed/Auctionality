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
public class QuestionNotificationEmailRequest extends EmailRequest {
    private String productTitle;
    private String productUrl;
    private String questionContent;
    private String askerName;

    public QuestionNotificationEmailRequest(String toEmail, String productTitle, String productUrl, 
                                             String questionContent, String askerName) {
        super(toEmail, "New question about your auction: " + productTitle);
        this.productTitle = productTitle;
        this.productUrl = productUrl;
        this.questionContent = questionContent;
        this.askerName = askerName;
    }
}

