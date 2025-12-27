package com.team2.auctionality.service;

import com.team2.auctionality.exception.WatchListAlreadyExistsException;
import com.team2.auctionality.model.WatchListItem;
import com.team2.auctionality.repository.WatchListItemRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
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
            throw new WatchListAlreadyExistsException("WatchListItem already exists");
        }
        return watchListItemRepository.save(watchListItem);
    }

    @Transactional
    public void deleteWatchListItem(Integer userId, Integer productId) {
        int deleted = watchListItemRepository
                .deleteByUserIdAndProductId(userId, productId);

        if (deleted == 0) {
            throw new EntityNotFoundException(
                    String.format(
                            "Watchlist item with productId=%d and userId=%d not found",
                            productId, userId
                    )
            );
        }
    }
}
