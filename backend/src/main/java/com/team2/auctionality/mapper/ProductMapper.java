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
                .name(product.getName())
                .description(product.getDescription())
                .startPrice(product.getStartPrice())
                .currentPrice(product.getCurrentPrice())
                .createdAt(product.getCreatedAt())
                .endTime(product.getEndTime())

                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .category(product.getCategory() != null ? categoryMapper.toDto(product.getCategory()) : null)
                .subcategory(product.getSubcategory() != null ? categoryMapper.toDto(product.getSubcategory()) : null)
                .build();
    }
}

