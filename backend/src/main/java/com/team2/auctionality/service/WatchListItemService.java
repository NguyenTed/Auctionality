package com.team2.auctionality.service;

import com.team2.auctionality.dto.WatchListItemDto;
import com.team2.auctionality.exception.WatchListAlreadyExistsException;
import com.team2.auctionality.mapper.WatchListItemMapper;
import com.team2.auctionality.model.WatchListItem;
import com.team2.auctionality.repository.WatchListItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WatchListItemService {

    private final WatchListItemRepository watchListItemRepository;

    public WatchListItem createWatchListItem(WatchListItem watchListItem) {

        Optional<WatchListItem> existing = watchListItemRepository.findByUserAndProduct(watchListItem.getUser(), watchListItem.getProduct());

        if (existing.isPresent()) {
            throw new WatchListAlreadyExistsException("Product already in watchlist");
        }
        return watchListItemRepository.save(watchListItem);
    }

}
