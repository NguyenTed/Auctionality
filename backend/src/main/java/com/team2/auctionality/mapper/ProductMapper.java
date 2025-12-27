package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.model.Category;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.ProductImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    public static ProductDto toDto(Product product) {
        if (product == null) return null;

        return ProductDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .status(product.getStatus())
                .startPrice(product.getStartPrice())
                .currentPrice(product.getCurrentPrice())
                .buyNowPrice(product.getBuyNowPrice())
                .bidIncrement(product.getBidIncrement())
                .startTime(product.getStartTime())
                .endTime(product.getEndTime())
                .autoExtensionEnabled(product.getAutoExtensionEnabled())

                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .category(product.getCategory() != null ? CategoryMapper.toDto(product.getCategory()) : null)
                .images(product.getImages() != null ? ProductImageMapper.toListDto(product.getImages()) : null)
                .build();
    }
}

