package com.team2.auctionality.service;

import com.team2.auctionality.dto.RatingRequest;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.OrderRatingRepository;
import com.team2.auctionality.repository.SellerUpgradeRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final WatchListItemService watchListItemService;
    private final ProductService productService;
    private final SellerUpgradeRequestRepository sellerUpgradeRequestRepository;
    private final OrderRatingRepository orderRatingRepository;
    private final OrderService orderService;

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

    public List<OrderRating> getOrderRatings(User user) {
        return orderRatingRepository.getOrderRatingByToUser(user);
    }

    public List<Product> getAuctionProducts(User user) {
        return productService.getAuctionProductsByUser(user.getId());
    }

    public List<Product> getWonProducts(User user) {
        return productService.getWonProducts(user);
    }

    public OrderRating rateUser(User user, RatingRequest ratingRequest) {
        Order order = orderService.getOrderById(ratingRequest.getOrderId());

        OrderRating orderRating = orderRatingRepository
                .findByOrderIdAndFromUser(ratingRequest.getOrderId(), user)
                .orElseGet(() -> {
                    OrderRating r = new OrderRating();
                    r.setOrderId(order.getId());
                    r.setFromUser(user);
                    r.setCreatedAt(new Date());
                    return r;
                });

        User toUser = ratingRequest.getIsBuyer()
                ? order.getSeller()   // buyer rate seller
                : order.getBuyer();   // seller rate buyer
        orderRating.setToUser(toUser);

        if (ratingRequest.getComment() != null) {
            orderRating.setComment(ratingRequest.getComment());
        }
        orderRating.setValue(ratingRequest.getValue());

        return orderRatingRepository.save(orderRating);
    }
}
