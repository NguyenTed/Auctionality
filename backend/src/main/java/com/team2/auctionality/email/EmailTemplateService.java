package com.team2.auctionality.email;

import com.team2.auctionality.email.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Email Template Service
 * Handles rendering of email templates using Thymeleaf
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateService {

    private final TemplateEngine templateEngine;

    /**
     * Render verification email template
     */
    public String renderVerificationEmail(VerificationEmailRequest request) {
        Context context = new Context();
        context.setVariable("userName", request.getUserName());
        context.setVariable("otp", request.getOtp());
        return templateEngine.process("email/verification", context);
    }

    /**
     * Render password reset email template
     */
    public String renderPasswordResetEmail(PasswordResetEmailRequest request) {
        Context context = new Context();
        context.setVariable("userName", request.getUserName());
        context.setVariable("resetUrl", request.getResetUrl());
        context.setVariable("resetToken", request.getResetToken());
        return templateEngine.process("email/password-reset", context);
    }

    /**
     * Render bid success notification template
     */
    public String renderBidSuccessNotification(BidNotificationEmailRequest request) {
        Context context = new Context();
        context.setVariable("productTitle", request.getProductTitle());
        context.setVariable("productUrl", request.getProductUrl());
        context.setVariable("bidAmount", request.getBidAmount());
        context.setVariable("bidderName", request.getBidderName());
        context.setVariable("type", request.getType());
        return templateEngine.process("email/bid-success", context);
    }

    /**
     * Render bidder rejected notification template
     */
    public String renderBidderRejectedNotification(String productTitle, String reason, String productUrl) {
        Context context = new Context();
        context.setVariable("productTitle", productTitle);
        context.setVariable("reason", reason);
        context.setVariable("productUrl", productUrl);
        return templateEngine.process("email/bidder-rejected", context);
    }

    /**
     * Render auction ended no bids notification template
     */
    public String renderAuctionEndedNoBids(String productTitle, String productUrl) {
        Context context = new Context();
        context.setVariable("productTitle", productTitle);
        context.setVariable("productUrl", productUrl);
        return templateEngine.process("email/auction-ended-no-bids", context);
    }

    /**
     * Render auction ended with winner notification template
     */
    public String renderAuctionEndedWithWinner(AuctionEndedEmailRequest request) {
        Context context = new Context();
        context.setVariable("productTitle", request.getProductTitle());
        context.setVariable("productUrl", request.getProductUrl());
        context.setVariable("finalPrice", request.getFinalPrice());
        context.setVariable("winnerName", request.getWinnerName());
        context.setVariable("hasWinner", request.isHasWinner());
        return templateEngine.process("email/auction-ended-winner", context);
    }

    /**
     * Render question notification template
     */
    public String renderQuestionNotification(QuestionNotificationEmailRequest request) {
        Context context = new Context();
        context.setVariable("productTitle", request.getProductTitle());
        context.setVariable("productUrl", request.getProductUrl());
        context.setVariable("questionContent", request.getQuestionContent());
        context.setVariable("askerName", request.getAskerName());
        return templateEngine.process("email/question-notification", context);
    }

    /**
     * Render answer notification template
     */
    public String renderAnswerNotification(AnswerNotificationEmailRequest request) {
        Context context = new Context();
        context.setVariable("productTitle", request.getProductTitle());
        context.setVariable("productUrl", request.getProductUrl());
        context.setVariable("answerContent", request.getAnswerContent());
        context.setVariable("responderName", request.getResponderName());
        return templateEngine.process("email/answer-notification", context);
    }

    /**
     * Render description update notification template
     */
    public String renderDescriptionUpdateNotification(DescriptionUpdateEmailRequest request) {
        Context context = new Context();
        context.setVariable("productTitle", request.getProductTitle());
        context.setVariable("productUrl", request.getProductUrl());
        context.setVariable("bidderName", request.getBidderName());
        return templateEngine.process("email/description-update", context);
    }
}

