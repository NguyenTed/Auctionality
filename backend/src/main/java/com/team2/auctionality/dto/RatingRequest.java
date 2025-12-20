package com.team2.auctionality.dto;

import com.team2.auctionality.annotation.ValidRatingValue;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingRequest {

    @NotNull
    private Integer orderId;

    @NotNull
    private Boolean isBuyer;

    @ValidRatingValue
    private Integer value;

    private String comment;
}
