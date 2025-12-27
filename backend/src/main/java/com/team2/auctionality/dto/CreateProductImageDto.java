package com.team2.auctionality.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductImageDto {

    @NotBlank
    private String url;

    private Boolean isThumbnail;
}
