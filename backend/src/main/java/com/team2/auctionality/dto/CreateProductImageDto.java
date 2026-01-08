package com.team2.auctionality.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductImageDto {

    @NotBlank(message = "Image URL is required")
    @Pattern(regexp = "^(https?://).+", message = "Image URL must be a valid HTTP/HTTPS URL")
    private String url;

    private Boolean isThumbnail;
}
