package com.team2.auctionality.controller;

import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.service.BidService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
@Tag(name = "Bid", description = "Product API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BidController {

    private final BidService bidService;

    @GetMapping()
    public ResponseEntity<List<BidHistoryDto>> getBidHistoryByProductId(
            @Parameter Integer productId) {
        return ResponseEntity.ok(
                bidService.getBidHistory(productId)
        );
    }

//    @PostMapping()
//    public ResponseEntity<List<BidHistoryDto>> placeBid(@RequestBody BidHistoryDto bidHistoryDto) {}
}
