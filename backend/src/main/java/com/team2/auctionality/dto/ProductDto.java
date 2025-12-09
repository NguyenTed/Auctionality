package com.team2.auctionality.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {

    private Integer id;
    private String name;
    private String description;
    private Double startPrice;
    private Double currentPrice;
    private LocalDateTime createdAt;
    private LocalDateTime endTime;

    private Integer sellerId;

    private CategoryDto category;

    private CategoryDto subcategory;

}

