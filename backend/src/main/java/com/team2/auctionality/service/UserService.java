package com.team2.auctionality.service;

import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.SellerUpgradeRequest;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.WatchListItem;
import com.team2.auctionality.repository.SellerUpgradeRequestRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final WatchListItemService watchListItemService;
    private final ProductService productService;
    private final SellerUpgradeRequestRepository sellerUpgradeRequestRepository;

    public WatchListItem addWatchList(User user, Integer productId) {
        Product product = productService.getProductById(productId);

        WatchListItem watchListItem = WatchListItem.builder()
                .user(user)
                .product(product)
                .createdAt(new Date())
                .build();
        return watchListItemService.createWatchListItem(watchListItem);

    }

    public void deleteWatchList(Integer userId, Integer productId) {
        watchListItemService.deleteWatchListItem(userId, productId);
    }

    public SellerUpgradeRequest createSellerUpgradeRequest(User user) {

        SellerUpgradeRequest sellerUpgradeRequest = SellerUpgradeRequest.builder()
                .user(user)
                .status(ApproveStatus.PENDING)
                .requestedAt(new Date())
                .build();
        return sellerUpgradeRequestRepository.save(sellerUpgradeRequest);
    }
}
