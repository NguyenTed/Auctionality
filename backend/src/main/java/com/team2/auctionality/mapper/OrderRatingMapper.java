package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.OrderRatingDto;
import com.team2.auctionality.model.OrderRating;
import org.springframework.stereotype.Component;

@Component
public class OrderRatingMapper {

    public static OrderRatingDto toDto(OrderRating orderRating) {
        return OrderRatingDto.builder()
                .id(orderRating.getId())
                .orderId(orderRating.getOrderId())
                .fromUser(UserMapper.toDto(orderRating.getFromUser()))
                .toUser(UserMapper.toDto(orderRating.getToUser()))
                .value(orderRating.getValue())
                .comment(orderRating.getComment())
                .createdAt(orderRating.getCreatedAt())
                .build();
    }



}
