package com.team2.auctionality.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderRatingDto {
    private Integer id;
    private Integer orderId;
    private UserDto fromUser;
    private UserDto toUser;
    private Integer value;
    private String comment;
    private Date createdAt;
}
