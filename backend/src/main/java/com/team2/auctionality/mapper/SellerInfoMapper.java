package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.SellerInfoDto;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class SellerInfoMapper {

    public static SellerInfoDto toDto(User seller) {
        if (seller == null) return null;

        UserProfile profile = seller.getProfile();
        return SellerInfoDto.builder()
                .id(seller.getId())
                .email(seller.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .ratingPercent(profile != null ? profile.getRatingPercent() : null)
                .build();
    }
}

