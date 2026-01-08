package com.team2.auctionality.scheduler;

import com.team2.auctionality.dto.AuctionEndNotificationDto;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.model.Bid;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.repository.BidRepository;
import com.team2.auctionality.repository.ProductRepository;
import com.team2.auctionality.service.OrderService;
import com.team2.auctionality.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionFinalizationScheduler {

    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void finalizeExpiredAuctions() {

        log.info("Running finalizeExpiredAuctions job");

        List<Product> expiredProducts =
                productRepository.findExpiredAndNotOrdered(LocalDateTime.now());

        for (Product product : expiredProducts) {

            // Set expired status for expired Product
            product.setStatus(ProductStatus.ENDED);
            productRepository.save(product);

            Bid highestBid = bidRepository
                    .findHighestBid(product.getId())
                    .orElse(null);


            if (highestBid == null) continue;

            Order order = orderService.createOrderForBuyNow(
                    product,
                    highestBid.getBidder().getId(),
                    highestBid.getAmount()
            );

            // Publish WebSocket notification for auction end
            AuctionEndNotificationDto notification = AuctionEndNotificationDto.builder()
                    .productId(product.getId())
                    .orderId(order.getId())
                    .buyerId(order.getBuyer().getId())
                    .sellerId(order.getSeller().getId())
                    .finalPrice(order.getFinalPrice())
                    .message("Auction ended! Order created. Please complete your payment.")
                    .build();

            // Send to product-specific topic
            messagingTemplate.convertAndSend("/topic/auction-end/" + product.getId(), notification);
            
            log.info("Published auction end notification for product {} with order {}", 
                    product.getId(), order.getId());
        }
    }
}