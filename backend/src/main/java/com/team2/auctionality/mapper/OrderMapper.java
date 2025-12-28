package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.OrderDto;
import com.team2.auctionality.model.Order;

public class OrderMapper {
    public static OrderDto toDto(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .product(ProductMapper.toDto(order.getProduct()))
                .buyer(UserMapper.toDto(order.getBuyer()))
                .seller(UserMapper.toDto(order.getSeller()))
                .finalPrice(order.getFinalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
