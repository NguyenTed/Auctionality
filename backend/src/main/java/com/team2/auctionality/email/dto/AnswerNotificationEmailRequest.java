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
public class AnswerNotificationEmailRequest extends EmailRequest {
    private String productTitle;
    private String productUrl;
    private String answerContent;
    private String responderName;

    public AnswerNotificationEmailRequest(String toEmail, String productTitle, String productUrl, 
                                          String answerContent, String responderName) {
        super(toEmail, "Answer to your question: " + productTitle);
        this.productTitle = productTitle;
        this.productUrl = productUrl;
        this.answerContent = answerContent;
        this.responderName = responderName;
    }
}

