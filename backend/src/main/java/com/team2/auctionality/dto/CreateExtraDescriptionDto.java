package com.team2.auctionality.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateExtraDescriptionDto {
    @NotBlank(message = "Description content is required")
    @Size(min = 10, max = 10000, message = "Description must be between 10 and 10000 characters")
    private String content;
}
