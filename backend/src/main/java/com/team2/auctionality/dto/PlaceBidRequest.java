package com.team2.auctionality.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PlaceBidRequest {
    @NotNull(message = "Bid amount is required")
    @Positive(message = "Bid amount must be positive")
    private Float amount;
}
