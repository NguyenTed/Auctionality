package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.UserDto;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public static UserDto toDto(User user) {

        UserProfile profile = user.getProfile();

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(profile.getFullName())
                .phoneNumber(profile.getPhoneNumber())
                .avatarUrl(profile.getAvatarUrl())
                .isEmailVerified(user.getIsEmailVerified())
                .status(user.getStatus())
                .ratingPercent(profile.getRatingPercent())
                .createdAt(user.getCreatedAt())
                .build();
    }

}
