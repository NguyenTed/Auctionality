package com.team2.auctionality.controller;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.mapper.*;
import com.team2.auctionality.model.*;
import com.team2.auctionality.service.AuthService;
import com.team2.auctionality.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User", description = "User API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {


    private final UserService userService;
    private final AuthService authService;

    @GetMapping("/watchlist")
    public List<WatchListItemDto> getWatchlist(Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        return userService.getWatchList(user);
    }

    @PostMapping("/watchlist/{productId}")
    @PreAuthorize("hasRole('BUYER') or hasAuthority('WATCHLIST_MANAGE')")
    public ResponseEntity<ApiResponse<WatchListItemDto>> addWatchlist(
            @PathVariable Integer productId,
            Authentication authentication) {

        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        URI location = URI.create(
                "/api/users/watchlist/" + productId
        );
        WatchListItemDto watchListItemDto = WatchListItemMapper.toDto(userService.addWatchList(user, productId));
        return ResponseEntity
                .created(location)
                .body(new ApiResponse<>(
                        "Add product to watchlist successfully",
                        watchListItemDto
                ));
    }

    @DeleteMapping("/watchlist/{productId}")
    @PreAuthorize("hasRole('BUYER') or hasAuthority('WATCHLIST_MANAGE')")
    public ResponseEntity<Map<String, Object>> deleteWatchlist(
            @PathVariable Integer productId,
            Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        userService.deleteWatchList(user.getId(), productId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Delete watchlist successfully");
        return ResponseEntity.ok(response);
    }

    /*
        Request to be upgraded from bidder to seller in 7 days
     */
    @PostMapping("/seller-upgrade-requests")
    @Operation(summary = "Request to be upgraded from bidder to seller in 7 days")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<SellerUpgradeRequestDto> upgradeRequests(Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        SellerUpgradeRequest request = userService.createSellerUpgradeRequest(user);

        URI location = URI.create("/api/users/seller-upgrade-requests" + request.getId());

        return ResponseEntity
                .created(location)
                .body(
                        SellerUpgradeRequestMapper.toDto(request)
                );
    }

    @GetMapping("/rates")
    @Operation(summary = "Get user's rates")
    @PreAuthorize("isAuthenticated()")
    public List<OrderRatingDto> getRatings(Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        List<OrderRating> ratings = userService.getOrderRatings(user);

        return ratings
                .stream()
                .filter(Objects::nonNull)
                .map(OrderRatingMapper::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/rates")
    @Operation(summary = "Rates seller / buyer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderRatingDto> rateUser(
            Authentication authentication,
            @Valid  @RequestBody RatingRequest ratingRequest ) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        userService.rateUser(user, ratingRequest);
        URI location = URI.create("/api/users/rates");

        return ResponseEntity
                .created(location)
                .body(
                        OrderRatingMapper.toDto(userService.rateUser(user, ratingRequest))
                );
    }

    @GetMapping("/auction-products")
    @Operation(summary = "Get products that user has placed bids on")
    @PreAuthorize("isAuthenticated()")
    public List<ProductDto> getAuctionProducts(Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        List<Product> products = userService.getAuctionProducts(user);

        return products
                .stream()
                .filter(Objects::nonNull)
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/won-products")
    @Operation(summary = "Get products that user has won")
    @PreAuthorize("isAuthenticated()")
    public List<ProductDto> getWonProducts(Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        List<Product> products = userService.getWonProducts(user);

        return products
                .stream()
                .filter(Objects::nonNull)
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }
}
