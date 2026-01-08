package com.team2.auctionality.rabbitmq;

import com.team2.auctionality.config.RabbitConfig;
import com.team2.auctionality.dto.ProductPriceUpdatedEvent;
import com.team2.auctionality.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductPriceEventListener {

    private final SseEmitterManager emitterManager;

    @RabbitListener(queues = RabbitConfig.PRODUCT_PRICE_QUEUE)
    public void onProductPriceUpdated(ProductPriceUpdatedEvent event) {
        log.info("Received product price update event for product {}: {} -> {}", 
                event.getProductId(), event.getPreviousPrice(), event.getNewPrice());
        emitterManager.sendProductPriceUpdate(
                event.getProductId(),
                event.getNewPrice(),
                event.getPreviousPrice()
        );
    }
}
