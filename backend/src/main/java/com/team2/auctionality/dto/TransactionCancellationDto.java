package com.team2.auctionality.dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionCancellationDto {
    private Integer id;
    private Integer orderId;
    private UserDto cancelledByUser;
    private String reason;
    private Date createdAt;
}
