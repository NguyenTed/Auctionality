package com.team2.auctionality.rabbitmq;

import com.team2.auctionality.config.RabbitConfig;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.BidHistoryUpdatedEvent;
import com.team2.auctionality.dto.ProductDto;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishProduct(ProductDto product) {

        rabbitTemplate.convertAndSend(
                RabbitConfig.PRODUCT_EXCHANGE,
                RabbitConfig.PRODUCT_ROUTING_KEY,
                product
        );
    }
}


