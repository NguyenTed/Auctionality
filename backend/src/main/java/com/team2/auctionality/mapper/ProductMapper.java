package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.dto.HighestBidderInfoDto;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.SellerInfoDto;
import com.team2.auctionality.model.Category;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.ProductImage;
import com.team2.auctionality.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final BidRepository bidRepository;

    public ProductDto toDto(Product product) {
        if (product == null) return null;

        // Get seller info
        SellerInfoDto sellerInfo = SellerInfoMapper.toDto(product.getSeller());

        // Get highest bidder info
        HighestBidderInfoDto highestBidderInfo = null;
        Optional<com.team2.auctionality.model.Bid> highestBidOpt = bidRepository.findTopBidByProductId(product.getId());
        if (highestBidOpt.isPresent()) {
            highestBidderInfo = HighestBidderInfoMapper.toDto(highestBidOpt.get());
        }

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
                .description(product.getDescription())
                .createdAt(product.getCreatedAt())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerInfo(sellerInfo)
                .highestBidderInfo(highestBidderInfo)
                .category(product.getCategory() != null ? CategoryMapper.toDto(product.getCategory()) : null)
                .images(product.getImages() != null ? ProductImageMapper.toListDto(product.getImages()) : null)
                .build();
    }

    // Static method for backward compatibility (used in OrderMapper, WatchListItemMapper)
    public static ProductDto toDto(Product product, BidRepository bidRepository) {
        if (product == null) return null;

        SellerInfoDto sellerInfo = SellerInfoMapper.toDto(product.getSeller());

        HighestBidderInfoDto highestBidderInfo = null;
        Optional<com.team2.auctionality.model.Bid> highestBidOpt = bidRepository.findTopBidByProductId(product.getId());
        if (highestBidOpt.isPresent()) {
            highestBidderInfo = HighestBidderInfoMapper.toDto(highestBidOpt.get());
        }

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
                .description(product.getDescription())
                .createdAt(product.getCreatedAt())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerInfo(sellerInfo)
                .highestBidderInfo(highestBidderInfo)
                .category(product.getCategory() != null ? CategoryMapper.toDto(product.getCategory()) : null)
                .images(product.getImages() != null ? ProductImageMapper.toListDto(product.getImages()) : null)
                .build();
    }
}

