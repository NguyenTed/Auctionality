package com.team2.auctionality.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductTopMostBidDto {
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

    private Integer bidCount;

    public ProductTopMostBidDto(
            Integer id, String name, String description,
            Double startPrice, Double currentPrice,
            LocalDateTime createdAt, LocalDateTime endTime,
            Integer sellerId,
            Integer categoryId, String categoryName, String categorySlug,
            Integer subcategoryId, String subcategoryName, String subcategorySlug,
            Long bidCount
    ){
        this.id = id;
        this.name = name;
        this.description = description;
        this.startPrice = startPrice;
        this.currentPrice = currentPrice;
        this.createdAt = createdAt;
        this.endTime = endTime;

        this.sellerId = sellerId;

        this.category = new CategoryDto(categoryId, categoryName, categorySlug, null);
        this.subcategory = new CategoryDto(subcategoryId, subcategoryName, subcategorySlug, null);

        this.bidCount = bidCount.intValue();
    }
}
