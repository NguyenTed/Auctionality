package com.team2.auctionality.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStatsDto {
    private long totalUsers;
    private long totalProducts;
    private long activeProducts;
    private long totalOrders;
    private long totalBids;
    private long endingSoonProducts;
    private long pendingSellerRequests;
}

