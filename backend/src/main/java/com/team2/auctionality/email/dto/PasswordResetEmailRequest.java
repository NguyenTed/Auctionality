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
public class PasswordResetEmailRequest extends EmailRequest {
    private String resetToken;
    private String resetUrl;
    private String userName;

    public PasswordResetEmailRequest(String toEmail, String resetToken, String resetUrl, String userName) {
        super(toEmail, "Reset your password - Auctionality");
        this.resetToken = resetToken;
        this.resetUrl = resetUrl;
        this.userName = userName;
    }
}

