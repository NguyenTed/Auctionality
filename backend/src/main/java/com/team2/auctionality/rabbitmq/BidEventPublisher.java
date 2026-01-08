package com.team2.auctionality.rabbitmq;

import com.team2.auctionality.config.RabbitConfig;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.BidHistoryUpdatedEvent;
import com.team2.auctionality.dto.ProductPriceUpdatedEvent;
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
                RabbitConfig.BID_EXCHANGE,
                RabbitConfig.BID_HISTORY_ROUTING_KEY,
                event
        );
    }

    public void publishProductPriceUpdate(Integer productId, Float newPrice, Float previousPrice) {
        ProductPriceUpdatedEvent event = new ProductPriceUpdatedEvent(productId, newPrice, previousPrice);
        rabbitTemplate.convertAndSend(
                RabbitConfig.BID_EXCHANGE,
                RabbitConfig.PRODUCT_PRICE_ROUTING_KEY,
                event
        );
    }
}


