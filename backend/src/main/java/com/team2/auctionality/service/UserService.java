package com.team2.auctionality.service;

import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.WatchListItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final WatchListItemService watchListItemService;
    private final ProductService productService;

    public Optional<WatchListItem> addWatchList(User user, Integer productId) {
        Product product = productService.getProductById(productId);

        WatchListItem watchListItem = WatchListItem.builder()
                .user(user)
                .product(product)
                .createdAt(new Date())
                .build();
        return Optional.ofNullable(watchListItemService.createWatchListItem(watchListItem));

    }
}
