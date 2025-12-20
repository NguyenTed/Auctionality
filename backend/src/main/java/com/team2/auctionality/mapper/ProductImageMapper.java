package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.ProductImageDto;
import com.team2.auctionality.model.ProductImage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProductImageMapper {

    public static ProductImageDto toDto(ProductImage image) {
        return ProductImageDto.builder()
                .id(image.getId())
                .url(image.getUrl())
                .isThumbnail(image.getIsThumbnail())
                .productId(image.getProduct().getId())
                .build();
    }

    public static List<ProductImageDto> toListDto(List<ProductImage> images) {
        List<ProductImageDto> dto = new ArrayList<>();

        for (ProductImage image : images) {
            dto.add(toDto(image));

        }

        return dto;
    }


}
