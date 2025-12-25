package com.team2.auctionality.rabbitmq;

import com.team2.auctionality.config.RabbitConfig;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.BidHistoryUpdatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BidEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishBidHistory(Integer productId, List<BidHistoryDto> histories) {

        BidHistoryUpdatedEvent event =
                new BidHistoryUpdatedEvent(productId, histories);

        rabbitTemplate.convertAndSend(
                RabbitConfig.EXCHANGE,
                RabbitConfig.ROUTING_KEY,
                event
        );
    }
}


