package com.team2.auctionality.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TakeDownProductRequest {
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
