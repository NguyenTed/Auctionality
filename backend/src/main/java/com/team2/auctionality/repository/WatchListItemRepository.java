package com.team2.auctionality.repository;

import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.WatchListItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WatchListItemRepository extends JpaRepository<WatchListItem, Integer> {
    Optional<WatchListItem> findByUserAndProduct(User user, Product product);
}
