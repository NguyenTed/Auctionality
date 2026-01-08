package com.team2.auctionality.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String BID_HISTORY_QUEUE = "bid.history.queue";
    public static final String BID_EXCHANGE = "bid.exchange";
    public static final String BID_HISTORY_ROUTING_KEY = "bid.history";
    public static final String PRODUCT_PRICE_QUEUE = "product.price.queue";
    public static final String PRODUCT_PRICE_ROUTING_KEY = "product.price";

    @Bean
    public MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonConverter());
        return template;
    }

    @Bean
    public Queue bidHistoryQueue() {
        return QueueBuilder.durable(BID_HISTORY_QUEUE).build();
    }

    @Bean
    public DirectExchange bidExchange() {
        return new DirectExchange(BID_EXCHANGE);
    }

    @Bean
    public Binding bidHistoryBinding() {
        return BindingBuilder
                .bind(bidHistoryQueue())
                .to(bidExchange())
                .with(BID_HISTORY_ROUTING_KEY);
    }

    @Bean
    public Queue productPriceQueue() {
        return QueueBuilder.durable(PRODUCT_PRICE_QUEUE).build();
    }

    @Bean
    public Binding productPriceBinding() {
        return BindingBuilder
                .bind(productPriceQueue())
                .to(bidExchange())
                .with(PRODUCT_PRICE_ROUTING_KEY);
    }
}

