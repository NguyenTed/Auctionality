package com.team2.auctionality.dto;

import com.team2.auctionality.enums.ApproveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SellerUpgradeRequestDto {
    private Integer id;
    private UserDto user;
    private UserDto processedByAdmin;
    private ApproveStatus status;
    private Date requestedAt;
    private Date processedAt;
}
