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
public class VerificationEmailRequest extends EmailRequest {
    private String otp;
    private String userName;

    public VerificationEmailRequest(String toEmail, String otp, String userName) {
        super(toEmail, "Verify your email address - Auctionality");
        this.otp = otp;
        this.userName = userName;
    }
}

