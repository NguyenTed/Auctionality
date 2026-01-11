package com.team2.auctionality.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductExtraDescriptionDto {
    private Integer id;
    private Integer productId;
    private String content;
    private LocalDateTime createdAt;
}
