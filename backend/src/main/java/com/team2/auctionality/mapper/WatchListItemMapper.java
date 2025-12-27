package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.WatchListItemDto;
import com.team2.auctionality.model.WatchListItem;
import org.springframework.stereotype.Component;

@Component
public class WatchListItemMapper {

    public static WatchListItemDto toDto(WatchListItem watchListItem) {
        return WatchListItemDto.builder()
                .id(watchListItem.getId())
                .user(UserMapper.toDto(watchListItem.getUser()))
                .product(ProductMapper.toDto(watchListItem.getProduct()))
                .createdAt(watchListItem.getCreatedAt())
                .build();
    }

}
