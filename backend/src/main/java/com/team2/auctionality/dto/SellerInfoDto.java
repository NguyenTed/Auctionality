package com.team2.auctionality.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for seller information in product responses
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerInfoDto {
    private Integer id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private Float ratingPercent;
}

