package com.team2.auctionality.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.team2.auctionality.email.config.SendGridConfig;
import com.team2.auctionality.email.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * SendGrid Email Service Implementation
 * Handles all email sending operations using SendGrid API
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SendGridEmailService implements EmailService {

    private final SendGrid sendGrid;
    private final EmailTemplateService templateService;
    private final SendGridConfig sendGridConfig;

    @Override
    @Async
    public void sendVerificationEmail(String toEmail, String otp, String userName) {
        try {
            VerificationEmailRequest request = new VerificationEmailRequest(toEmail, otp, userName);
            String htmlContent = templateService.renderVerificationEmail(request);
            sendEmail(toEmail, request.getSubject(), htmlContent);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl, String userName) {
        try {
            PasswordResetEmailRequest request = new PasswordResetEmailRequest(toEmail, resetToken, resetUrl, userName);
            String htmlContent = templateService.renderPasswordResetEmail(request);
            sendEmail(toEmail, request.getSubject(), htmlContent);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendBidSuccessNotification(BidNotificationEmailRequest request) {
        try {
            String htmlContent = templateService.renderBidSuccessNotification(request);
            sendEmail(request.getToEmail(), request.getSubject(), htmlContent);
            log.info("Bid success notification sent to: {} for product: {}", request.getToEmail(), request.getProductTitle());
        } catch (Exception e) {
            log.error("Failed to send bid success notification to {}: {}", request.getToEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendBidderRejectedNotification(String toEmail, String productTitle, String reason, String productUrl) {
        try {
            String htmlContent = templateService.renderBidderRejectedNotification(productTitle, reason, productUrl);
            String subject = "Bidder rejection: " + productTitle;
            sendEmail(toEmail, subject, htmlContent);
            log.info("Bidder rejected notification sent to: {} for product: {}", toEmail, productTitle);
        } catch (Exception e) {
            log.error("Failed to send bidder rejected notification to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendAuctionEndedNoBidsNotification(String toEmail, String productTitle, String productUrl) {
        try {
            String htmlContent = templateService.renderAuctionEndedNoBids(productTitle, productUrl);
            String subject = "Auction ended - No bids: " + productTitle;
            sendEmail(toEmail, subject, htmlContent);
            log.info("Auction ended (no bids) notification sent to: {} for product: {}", toEmail, productTitle);
        } catch (Exception e) {
            log.error("Failed to send auction ended notification to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendAuctionEndedWithWinnerNotification(AuctionEndedEmailRequest request) {
        try {
            String htmlContent = templateService.renderAuctionEndedWithWinner(request);
            sendEmail(request.getToEmail(), request.getSubject(), htmlContent);
            log.info("Auction ended (with winner) notification sent to: {} for product: {}", 
                    request.getToEmail(), request.getProductTitle());
        } catch (Exception e) {
            log.error("Failed to send auction ended notification to {}: {}", request.getToEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendQuestionNotification(QuestionNotificationEmailRequest request) {
        try {
            String htmlContent = templateService.renderQuestionNotification(request);
            sendEmail(request.getToEmail(), request.getSubject(), htmlContent);
            log.info("Question notification sent to: {} for product: {}", request.getToEmail(), request.getProductTitle());
        } catch (Exception e) {
            log.error("Failed to send question notification to {}: {}", request.getToEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendAnswerNotification(AnswerNotificationEmailRequest request) {
        try {
            String htmlContent = templateService.renderAnswerNotification(request);
            sendEmail(request.getToEmail(), request.getSubject(), htmlContent);
            log.info("Answer notification sent to: {} for product: {}", request.getToEmail(), request.getProductTitle());
        } catch (Exception e) {
            log.error("Failed to send answer notification to {}: {}", request.getToEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async
    public void sendDescriptionUpdateNotification(DescriptionUpdateEmailRequest request) {
        try {
            String htmlContent = templateService.renderDescriptionUpdateNotification(request);
            sendEmail(request.getToEmail(), request.getSubject(), htmlContent);
            log.info("Description update notification sent to: {} for product: {}", request.getToEmail(), request.getProductTitle());
        } catch (Exception e) {
            log.error("Failed to send description update notification to {}: {}", request.getToEmail(), e.getMessage(), e);
        }
    }

    /**
     * Core method to send email via SendGrid
     */
    private void sendEmail(String toEmail, String subject, String htmlContent) throws IOException {
        Email from = new Email(sendGridConfig.getFromEmail(), sendGridConfig.getFromName());
        Email to = new Email(toEmail);
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, to, content);

        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sendGrid.api(request);
        
        if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
            log.debug("Email sent successfully to: {}", toEmail);
        } else {
            log.warn("Email send returned status {}: {}", response.getStatusCode(), response.getBody());
            throw new IOException("SendGrid API returned status: " + response.getStatusCode());
        }
    }
}

