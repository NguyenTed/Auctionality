package com.team2.auctionality.rabbitmq;

import com.team2.auctionality.config.RabbitConfig;
import com.team2.auctionality.dto.BidHistoryUpdatedEvent;
import com.team2.auctionality.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BidHistoryEventListener {

    private final SseEmitterManager emitterManager;

    @RabbitListener(queues = RabbitConfig.QUEUE)
    public void onBidHistoryUpdated(BidHistoryUpdatedEvent event) {
        emitterManager.send(
                event.getProductId(),
                event.getBidHistories()
        );
    }
}


