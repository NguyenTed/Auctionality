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
        return toDto(user, false);
    }

    public static UserDto toDto(User user, boolean maskName) {
        if (user == null) return null;
        UserProfile profile = user.getProfile() != null ? user.getProfile() : null;

        Set<String> roles = user.getRoles() != null
                ? user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        String fullName = profile != null ? profile.getFullName() : null;
        if (maskName && fullName != null) {
            fullName = maskName(fullName);
        }

        return UserDto.builder()
                .id(user.getId())
                .email(maskName ? null : user.getEmail()) // Don't expose email if masked
                .fullName(fullName)
                .phoneNumber(maskName ? null : (profile != null ? profile.getPhoneNumber() : null)) // Don't expose phone if masked
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .isEmailVerified(maskName ? null : user.getIsEmailVerified())
                .status(user.getStatus())
                .ratingPercent(profile != null ? profile.getRatingPercent() : null)
                .createdAt(user.getCreatedAt())
                .roles(roles)
                .build();
    }

    private static String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "****";
        }

        String[] parts = fullName.trim().split("\\s+");

        if (parts.length == 1) {
            return parts[0];
        }

        StringBuilder masked = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            masked.append("**** ");
        }
        masked.append(parts[parts.length - 1]);

        return masked.toString();
    }

}
