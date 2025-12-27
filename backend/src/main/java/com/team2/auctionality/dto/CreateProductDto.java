package com.team2.auctionality.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductDto {
    @NotBlank
    private String title;

    @NotNull
    private Integer categoryId;

    @NotNull
    @Positive
    private Float startPrice;

    @Positive
    private Float bidIncrement;

    @Positive
    private Float buyNowPrice;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    private Boolean autoExtensionEnabled;

    @NotBlank
    private String description;

    @NotNull
    @Size(min = 3, message = "must have at least 3 images")
    private List<CreateProductImageDto> images;
}
