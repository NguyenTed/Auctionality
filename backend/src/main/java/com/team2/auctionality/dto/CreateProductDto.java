package com.team2.auctionality.dto;

import com.team2.auctionality.annotation.ValidBuyNowPrice;
import com.team2.auctionality.annotation.ValidEndTime;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ValidEndTime
@ValidBuyNowPrice
public class CreateProductDto {
    @NotBlank(message = "Product title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @NotNull(message = "Category is required")
    @Positive(message = "Category ID must be positive")
    private Integer categoryId;

    @NotNull(message = "Start price is required")
    @Positive(message = "Start price must be positive")
    @DecimalMin(value = "0.01", message = "Start price must be at least 0.01")
    private Float startPrice;

    @Positive(message = "Bid increment must be positive")
    @DecimalMin(value = "0.01", message = "Bid increment must be at least 0.01")
    private Float bidIncrement;

    @Positive(message = "Buy now price must be positive")
    @DecimalMin(value = "0.01", message = "Buy now price must be at least 0.01")
    private Float buyNowPrice;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private Boolean autoExtensionEnabled;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 10000, message = "Description must be between 10 and 10000 characters")
    private String description;

    @NotNull(message = "Images are required")
    @Size(min = 3, max = 10, message = "Must have between 3 and 10 images")
    private List<CreateProductImageDto> images;
}
