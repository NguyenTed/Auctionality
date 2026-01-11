package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.dto.HighestBidderInfoDto;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.ProductExtraDescriptionDto;
import com.team2.auctionality.dto.SellerInfoDto;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.BidRepository;
import com.team2.auctionality.repository.ProductExtraDescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    public static ProductDto toDto(Product product, Bid highestBidder, List<ProductExtraDescription> extraDescriptions) {
        if (product == null) return null;

        ProductDto.ProductDtoBuilder builder = ProductDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .status(product.getStatus())
                .startPrice(product.getStartPrice())
                .currentPrice(product.getCurrentPrice())
                .buyNowPrice(product.getBuyNowPrice())
                .bidIncrement(product.getBidIncrement())
                .startTime(product.getStartTime())
                .endTime(product.getEndTime())
                .createdAt(product.getCreatedAt())
                .sellerInfo(SellerInfoMapper.toDto(product.getSeller()))
                .autoExtensionEnabled(product.getAutoExtensionEnabled())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .category(product.getCategory() != null ? CategoryMapper.toDto(product.getCategory()) : null)
                .images(product.getImages() != null ? ProductImageMapper.toListDto(product.getImages()) : null)
                .extraDescriptions(extraDescriptions != null ? extraDescriptions.stream()
                        .map(ed -> ProductExtraDescriptionDto.builder()
                                .id(ed.getId())
                                .productId(ed.getProductId())
                                .content(ed.getContent())
                                .createdAt(ed.getCreatedAt())
                                .build())
                        .collect(Collectors.toList()) : null);

        // optional highest bidder
        if (highestBidder != null) {
            builder
                    .highestBidderInfo(HighestBidderInfoMapper.toDto(highestBidder));
        }

        return builder.build();
    }

    public static ProductDto toDto(Product product, Bid highestBidder) {
        return toDto(product, highestBidder, null);
    }

    public static ProductDto toDto(Product product, List<ProductExtraDescription> extraDescriptions) {
        return toDto(product, null, extraDescriptions);
    }

    public static ProductDto toDto(Product product) {
        return toDto(product, null, null);
    }
}
