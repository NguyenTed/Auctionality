package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.model.Category;
import com.team2.auctionality.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final CategoryMapper categoryMapper;

    public ProductDto toDto(Product product) {
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
                .category(product.getCategory() != null ? categoryMapper.toDto(product.getCategory()) : null)
                .build();
    }
}

