package com.team2.auctionality.dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductQuestionDto {
    private Integer id;
    private String content;
    private Date createdAt;
    private UserDto asker;
    private ProductDto product;
}
