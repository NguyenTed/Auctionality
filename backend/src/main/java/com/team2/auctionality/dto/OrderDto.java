package com.team2.auctionality.dto;

import com.team2.auctionality.enums.OrderStatus;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Integer id;
    private ProductDto product;
    private UserDto buyer;
    private UserDto seller;
    private Float finalPrice;
    private OrderStatus status;
    private Date createdAt;
}
