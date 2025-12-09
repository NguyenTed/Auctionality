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
    private String title;
    private String status;
    private Float startPrice;
    private Float currentPrice;
    private Float buyNowPrice;
    private Float bidIncrement;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean autoExtensionEnabled;

    private Integer sellerId;

    private CategoryDto category;

    private Integer bidCount;

    public ProductTopMostBidDto(
            Integer id, String title, String status,
            Float startPrice, Float currentPrice, Float buyNowPrice, Float bidIncrement,
            LocalDateTime startTime, LocalDateTime endTime,
            Boolean autoExtensionEnabled, Integer sellerId,
            Integer categoryId, String categoryName, String categorySlug,
            Long bidCount
    ){
        this.id = id;
        this.title = title;
        this.status = status;
        this.startPrice = startPrice;
        this.currentPrice = currentPrice;
        this.buyNowPrice = buyNowPrice;
        this.bidIncrement = bidIncrement;
        this.startTime = startTime;
        this.endTime = endTime;
        this.autoExtensionEnabled = autoExtensionEnabled;

        this.sellerId = sellerId;

        this.category = new CategoryDto(categoryId, categoryName, categorySlug, null);

        this.bidCount = bidCount.intValue();
    }
}
