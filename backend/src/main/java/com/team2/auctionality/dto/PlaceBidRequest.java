package com.team2.auctionality.dto;

import jakarta.validation.constraints.DecimalMin;
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
    @DecimalMin(value = "0.01", message = "Bid amount must be at least 0.01")
    private Float amount;
}
