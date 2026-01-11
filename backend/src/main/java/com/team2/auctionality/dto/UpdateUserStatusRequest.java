package com.team2.auctionality.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserStatusRequest {
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "ACTIVE|SUSPENDED|BANNED", message = "Status must be one of: ACTIVE, SUSPENDED, BANNED")
    private String status;
}
