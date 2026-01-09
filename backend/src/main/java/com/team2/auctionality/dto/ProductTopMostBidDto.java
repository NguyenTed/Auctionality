package com.team2.auctionality.dto;

import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.mapper.CategoryMapper;
import com.team2.auctionality.mapper.ProductImageMapper;
import com.team2.auctionality.model.Category;
import com.team2.auctionality.model.ProductImage;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductTopMostBidDto {
    private Integer id;
    private String title;
    private ProductStatus status;
    private Float startPrice;
    private Float currentPrice;
    private Float buyNowPrice;
    private Float bidIncrement;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean autoExtensionEnabled;
    private String description;
    private HighestBidderInfoDto highestBidderInfo;

    private Integer sellerId;

    private CategoryDto category;

    private List<ProductImageDto> images;

    private Integer bidCount;

    public ProductTopMostBidDto(
            Integer id, String title, String description, ProductStatus status,
            Float startPrice, Float currentPrice, Float buyNowPrice, Float bidIncrement,
            LocalDateTime startTime, LocalDateTime endTime,
            Boolean autoExtensionEnabled, Integer sellerId,
            Category category,
            List<ProductImage> images,
            Long bidCount,
            HighestBidderInfoDto highestBidderInfo
    ){
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.startPrice = startPrice;
        this.currentPrice = currentPrice;
        this.buyNowPrice = buyNowPrice;
        this.bidIncrement = bidIncrement;
        this.startTime = startTime;
        this.endTime = endTime;
        this.autoExtensionEnabled = autoExtensionEnabled;

        this.sellerId = sellerId;

        this.category = CategoryMapper.toDto(category);
        
        this.images = images != null ? ProductImageMapper.toListDto(images) : null;

        this.bidCount = bidCount.intValue();

        this.highestBidderInfo = highestBidderInfo;
    }
}
