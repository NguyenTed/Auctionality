package com.team2.auctionality.rabbitmq;

import com.team2.auctionality.config.RabbitConfig;
import com.team2.auctionality.dto.BidHistoryUpdatedEvent;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductEventListener {

    private final SseEmitterManager emitterManager;

    @RabbitListener(queues = RabbitConfig.PRODUCT_QUEUE)
    public void onBidHistoryUpdated(ProductDto event) {
        emitterManager.send(
                event.getId(),
                event
        );
    }
}


