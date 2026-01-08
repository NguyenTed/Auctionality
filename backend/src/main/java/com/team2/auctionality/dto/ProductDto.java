package com.team2.auctionality.dto;

import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.model.ProductImage;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {

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

    private LocalDateTime createdAt;

    private Integer sellerId;
    private SellerInfoDto sellerInfo;

    private HighestBidderInfoDto highestBidderInfo;

    private CategoryDto category;

    private List<ProductImageDto> images;

}

