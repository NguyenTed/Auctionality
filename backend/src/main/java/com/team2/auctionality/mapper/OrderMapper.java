package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.OrderDto;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderMapper {
    private final BidRepository bidRepository;

    public OrderDto toDto(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .product(ProductMapper.toDto(order.getProduct(), bidRepository))
                .buyer(UserMapper.toDto(order.getBuyer()))
                .seller(UserMapper.toDto(order.getSeller()))
                .finalPrice(order.getFinalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
