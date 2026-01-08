package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.UserDto;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.UserProfile;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public static UserDto toDto(User user) {
        if (user == null) return null;
        UserProfile profile = user.getProfile() != null ? user.getProfile() : null;

        Set<String> roles = user.getRoles() != null
                ? user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(profile != null ? profile.getFullName() : null)
                .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .isEmailVerified(user.getIsEmailVerified())
                .status(user.getStatus())
                .ratingPercent(profile != null ? profile.getRatingPercent() : null)
                .createdAt(user.getCreatedAt())
                .roles(roles)
                .build();
    }

}
