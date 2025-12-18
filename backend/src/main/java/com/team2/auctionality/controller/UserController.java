package com.team2.auctionality.controller;

import com.team2.auctionality.dto.ApiResponse;
import com.team2.auctionality.dto.WatchListItemDto;
import com.team2.auctionality.mapper.WatchListItemMapper;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.WatchListItem;
import com.team2.auctionality.service.AuthService;
import com.team2.auctionality.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User", description = "User API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {


    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/watchlist/{productId}")
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
}
