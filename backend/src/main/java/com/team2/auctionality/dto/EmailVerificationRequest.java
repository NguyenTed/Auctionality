package com.team2.auctionality.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailVerificationRequest {
    @NotBlank(message = "Token is required")
    private String token;
}

