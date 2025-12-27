package com.team2.auctionality.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageDto {
    private Integer id;
    private String url;
    private Boolean isThumbnail;
    private Integer productId;
}
