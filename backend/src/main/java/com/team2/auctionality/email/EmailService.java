package com.team2.auctionality.email;

import com.team2.auctionality.email.dto.*;

/**
 * Email Service Interface
 * Defines all email operations for the application
 */
public interface EmailService {
    /**
     * Send email verification OTP to user
     */
    void sendVerificationEmail(String toEmail, String otp, String userName);

    /**
     * Send password reset email with reset link
     */
    void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl, String userName);

    /**
     * Send bid success notification
     */
    void sendBidSuccessNotification(BidNotificationEmailRequest request);

    /**
     * Send bidder rejected notification
     */
    void sendBidderRejectedNotification(String toEmail, String productTitle, String reason, String productUrl);

    /**
     * Send auction ended with no bids notification
     */
    void sendAuctionEndedNoBidsNotification(String toEmail, String productTitle, String productUrl);

    /**
     * Send auction ended with winner notification
     */
    void sendAuctionEndedWithWinnerNotification(AuctionEndedEmailRequest request);

    /**
     * Send question notification to seller
     */
    void sendQuestionNotification(QuestionNotificationEmailRequest request);

    /**
     * Send answer notification to question asker
     */
    void sendAnswerNotification(AnswerNotificationEmailRequest request);
}

