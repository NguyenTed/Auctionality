package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.WatchListItemDto;
import com.team2.auctionality.model.Bid;
import com.team2.auctionality.model.WatchListItem;
import com.team2.auctionality.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WatchListItemMapper {
    private final BidRepository bidRepository;

    public WatchListItemDto toDto(WatchListItem watchListItem) {
        // Get the highest bid for the product
        Bid highestBid = bidRepository
                .findHighestBid(watchListItem.getProduct().getId())
                .orElse(null);

        return WatchListItemDto.builder()
                .id(watchListItem.getId())
                .user(UserMapper.toDto(watchListItem.getUser()))
                .product(ProductMapper.toDto(watchListItem.getProduct(), highestBid))
                .createdAt(watchListItem.getCreatedAt())
                .build();
    }
}
