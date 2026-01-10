package com.team2.auctionality.auction;

import com.team2.auctionality.dto.AutoBidResult;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.mapper.BidMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.rabbitmq.BidEventPublisher;
import com.team2.auctionality.repository.AutoBidConfigRepository;
import com.team2.auctionality.repository.BidRepository;
import com.team2.auctionality.repository.ProductRepository;
import com.team2.auctionality.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AutoBidEngine {

    private final AutoBidConfigRepository autoBidConfigRepository;
    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final UserService userService;
    private final SystemAuctionRuleService systemAuctionRuleService;
    private final ProductService productService;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final BidEventPublisher bidEventPublisher;

    @Transactional
    public AutoBidResult recalculate(Integer productId) {
        log.debug("Recalculating auto-bid for product: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        List<AutoBidConfig> bidders =
                autoBidConfigRepository.findByProductId(productId);

        if (bidders.isEmpty()) {
            return new AutoBidResult(false, null);
        }

        // sort: maxPrice desc, createdAt asc
        bidders.sort(
                Comparator
                        .comparing(AutoBidConfig::getMaxPrice).reversed()
                        .thenComparing(AutoBidConfig::getCreatedAt)
        );

        AutoBidConfig winnerConfig = bidders.get(0);
        Float newPrice;

        if (bidders.size() == 1) {
            newPrice = product.getStartPrice();
        } else {
            AutoBidConfig second = bidders.get(1);
            newPrice = Math.min(second.getMaxPrice() + product.getBidIncrement(), winnerConfig.getMaxPrice());

        }
        Bid bid = null;
        // price not changed -> nothing to do
        if (product.getCurrentPrice() != null &&
                product.getCurrentPrice().compareTo(newPrice) != 0) {
            // Store previous price before updating
            Float previousPrice = product.getCurrentPrice();
            
            // update product
            product.setCurrentPrice(newPrice);
            productRepository.save(product);

            // generate bid history
            bid = Bid.builder()
                    .product(product)
                    .bidder(userService.getUserById(winnerConfig.getBidderId()))
                    .amount(newPrice)
                    .isAutoBid(true)
                    .createdAt(new Date())
                    .build();

            bidRepository.save(bid);

            // Publish price update and bid history via RabbitMQ after transaction commit
            final Float finalPreviousPrice = previousPrice;
            final Float finalNewPrice = newPrice;
            final Integer finalProductId = productId;
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            // Publish product price update
                            bidEventPublisher.publishProductPriceUpdate(
                                    finalProductId,
                                    finalNewPrice,
                                    finalPreviousPrice
                            );
                            log.info("Published product price update for product {}: {} -> {}", 
                                    finalProductId, finalPreviousPrice, finalNewPrice);
                            
                            // Publish bid history update so all viewers see the new bid
                            try {
                                List<BidHistoryDto> histories = bidRepository.findByProductIdOrderByCreatedAtDesc(finalProductId)
                                        .stream()
                                        .map(BidMapper::toDto)
                                        .toList();
                                bidEventPublisher.publishBidHistory(finalProductId, histories);
                                log.info("Published bid history update for product {} with {} bids", 
                                        finalProductId, histories.size());
                            } catch (Exception e) {
                                log.error("Error publishing bid history update for product {}", finalProductId, e);
                            }
                        }
                    }
            );
        }

        if (product.getBuyNowPrice() != null &&
                bidders.getFirst().getMaxPrice().compareTo(product.getBuyNowPrice()) >= 0) {
            // End auction
            product.setEndTime(LocalDateTime.now());
            product.setStatus(ProductStatus.ENDED);
            productRepository.save(product);

            // Create order
            Order order = orderService.createOrderForBuyNow(
                    product,
                    winnerConfig.getBidderId(),
                    bidders.getFirst().getMaxPrice()
            );


            return new AutoBidResult(true, bid);
        }

        // If product's endTime <= timeThreshold --> plus extension minutes.
        systemAuctionRuleService.getActiveRule().ifPresent(rule -> {

            long minutesToEnd = Duration
                    .between(LocalDateTime.now(), product.getEndTime())
                    .toMinutes();

            if (minutesToEnd <= rule.getTimeThresholdMinutes()) {
                product.setEndTime(
                        product.getEndTime().plusMinutes(rule.getExtensionMinutes())
                );
                productService.save(product);
            }
        });


        return new AutoBidResult(true, bid);
    }
}
