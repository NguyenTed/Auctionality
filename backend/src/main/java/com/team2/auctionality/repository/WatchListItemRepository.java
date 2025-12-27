package com.team2.auctionality.repository;

import com.team2.auctionality.dto.WatchListItemDto;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.WatchListItem;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WatchListItemRepository extends JpaRepository<WatchListItem, Integer> {
    Optional<WatchListItem> findByUserAndProduct(User user, Product product);

    @Modifying
    @Transactional
    int deleteByUserIdAndProductId(Integer userId, Integer productId);

    List<WatchListItemDto> getWatchListItemByUser(User user);
}
