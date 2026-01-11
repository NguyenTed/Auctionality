package com.team2.auctionality.service;

import com.team2.auctionality.dto.WatchListItemDto;
import com.team2.auctionality.exception.WatchListAlreadyExistsException;
import com.team2.auctionality.mapper.WatchListItemMapper;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.WatchListItem;
import com.team2.auctionality.repository.WatchListItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatchListItemService {

    private final WatchListItemRepository watchListItemRepository;
    private final WatchListItemMapper watchListItemMapper;

    @Transactional
    public WatchListItem createWatchListItem(WatchListItem watchListItem) {
        Optional<WatchListItem> existing = watchListItemRepository.findByUserAndProduct(
                watchListItem.getUser(),
                watchListItem.getProduct()
        );

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

    @Transactional(readOnly = true)
    public List<WatchListItemDto> getWatchList(User user) {
        List<WatchListItem> watchListItems = watchListItemRepository.findByUser(user);
        return watchListItems.stream()
                .map(watchListItemMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<WatchListItemDto> getWatchListWithFilters(User user, String keyword, Integer categoryId, Pageable pageable) {
        Page<WatchListItem> watchListItems = watchListItemRepository.findByUserWithFilters(
                user.getId(),
                keyword,
                categoryId,
                pageable
        );
        return watchListItems.map(watchListItemMapper::toDto);
    }
}
