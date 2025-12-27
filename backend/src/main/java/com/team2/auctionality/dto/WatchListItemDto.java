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
public class WatchListItemDto {
    private Integer id;
    private UserDto user;
    private ProductDto product;
    private Date createdAt;
}
