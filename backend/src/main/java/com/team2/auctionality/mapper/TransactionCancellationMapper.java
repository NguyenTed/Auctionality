package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.TransactionCancellationDto;
import com.team2.auctionality.model.TransactionCancellation;
import org.springframework.stereotype.Component;

@Component
public class TransactionCancellationMapper {
    public static TransactionCancellationDto toDto (TransactionCancellation transactionCancellation) {
        return TransactionCancellationDto.builder()
                .id(transactionCancellation.getId())
                .orderId(transactionCancellation.getOrderId())
                .cancelledByUser(UserMapper.toDto(transactionCancellation.getCancelledByUser()))
                .reason(transactionCancellation.getReason())
                .createdAt(transactionCancellation.getCreatedAt())
                .build();
    }
}
