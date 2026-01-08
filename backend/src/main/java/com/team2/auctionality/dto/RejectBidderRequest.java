package com.team2.auctionality.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RejectBidderRequest {
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
