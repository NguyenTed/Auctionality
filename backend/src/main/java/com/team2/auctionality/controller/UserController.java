package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.*;
import com.team2.auctionality.mapper.*;
import com.team2.auctionality.model.*;
import com.team2.auctionality.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User", description = "User API")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final WatchListItemMapper watchListItemMapper;
    private final ProductMapper productMapper;

    @GetMapping("/watchlist")
    @Operation(summary = "Get user's watchlist")
    public ResponseEntity<List<WatchListItemDto>> getWatchlist(@CurrentUser User user) {
        log.debug("Getting watchlist for user: {}", user.getId());
        List<WatchListItemDto> watchlist = userService.getWatchList(user);
        return ResponseEntity.ok(watchlist);
    }

    @PostMapping("/watchlist/{productId}")
    @Operation(summary = "Add product to watchlist")
    public ResponseEntity<ApiResponse<WatchListItemDto>> addWatchlist(
            @PathVariable Integer productId,
            @CurrentUser User user
    ) {
        log.info("User {} adding product {} to watchlist", user.getId(), productId);
        WatchListItemDto watchListItemDto = watchListItemMapper.toDto(userService.addWatchList(user, productId));
        URI location = URI.create("/api/users/watchlist/" + productId);
        return ResponseEntity
                .created(location)
                .body(new ApiResponse<>(
                        "Add product to watchlist successfully",
                        watchListItemDto
                ));
    }

    @DeleteMapping("/watchlist/{productId}")
    @Operation(summary = "Remove product from watchlist")
    public ResponseEntity<ApiResponse<Void>> deleteWatchlist(
            @PathVariable Integer productId,
            @CurrentUser User user
    ) {
        log.info("User {} removing product {} from watchlist", user.getId(), productId);
        userService.deleteWatchList(user.getId(), productId);
        return ResponseEntity.ok(new ApiResponse<>("Delete watchlist successfully", null));
    }

    @PostMapping("/seller-upgrade-requests")
    @Operation(summary = "Request to be upgraded from bidder to seller")
    public ResponseEntity<SellerUpgradeRequestDto> createSellerUpgradeRequest(@CurrentUser User user) {
        log.info("User {} requesting seller upgrade", user.getId());
        SellerUpgradeRequest request = userService.createSellerUpgradeRequest(user);
        URI location = URI.create("/api/users/seller-upgrade-requests/" + request.getId());
        return ResponseEntity
                .created(location)
                .body(SellerUpgradeRequestMapper.toDto(request));
    }

    @GetMapping("/rates")
    @Operation(summary = "Get user's ratings")
    public ResponseEntity<List<OrderRatingDto>> getRatings(@CurrentUser User user) {
        log.debug("Getting ratings for user: {}", user.getId());
        List<OrderRating> ratings = userService.getOrderRatings(user);
        List<OrderRatingDto> ratingDtos = ratings.stream()
                .filter(Objects::nonNull)
                .map(OrderRatingMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ratingDtos);
    }

    @PostMapping("/rates")
    @Operation(summary = "Rate seller or buyer")
    public ResponseEntity<OrderRatingDto> rateUser(
            @CurrentUser User user,
            @Valid @RequestBody RatingRequest ratingRequest
    ) {
        log.info("User {} rating order {}", user.getId(), ratingRequest.getOrderId());
        OrderRating rating = userService.rateUser(user, ratingRequest);
        URI location = URI.create("/api/users/rates/" + rating.getId());
        return ResponseEntity
                .created(location)
                .body(OrderRatingMapper.toDto(rating));
    }

    @GetMapping("/auction-products")
    @Operation(summary = "Get products that user has placed bids on")
    public ResponseEntity<List<ProductDto>> getAuctionProducts(@CurrentUser User user) {
        log.debug("Getting auction products for user: {}", user.getId());
        List<Product> products = userService.getAuctionProducts(user);
        List<ProductDto> productDtos = products.stream()
                .filter(Objects::nonNull)
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/won-products")
    @Operation(summary = "Get products that user has won")
    public ResponseEntity<List<ProductDto>> getWonProducts(@CurrentUser User user) {
        log.debug("Getting won products for user: {}", user.getId());
        List<Product> products = userService.getWonProducts(user);
        List<ProductDto> productDtos = products.stream()
                .filter(Objects::nonNull)
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productDtos);
    }
}
