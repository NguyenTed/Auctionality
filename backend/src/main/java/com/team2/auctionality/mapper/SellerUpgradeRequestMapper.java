package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.SellerUpgradeRequestDto;
import com.team2.auctionality.model.SellerUpgradeRequest;
import org.springframework.stereotype.Component;

@Component
public class SellerUpgradeRequestMapper {
    public static SellerUpgradeRequestDto toDto(SellerUpgradeRequest request) {
        return SellerUpgradeRequestDto.builder()
                .id(request.getId())
                .user(UserMapper.toDto(request.getUser()))
                .processedByAdmin(UserMapper.toDto(request.getProcessedByAdmin()))
                .status(request.getStatus())
                .requestedAt(request.getRequestedAt())
                .processedAt(request.getProcessedAt())
                .build();
    }
}
