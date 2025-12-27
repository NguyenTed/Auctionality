package com.team2.auctionality.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BidHistoryUpdatedEvent {
    private Integer productId;
    private List<BidHistoryDto> bidHistories;
}
