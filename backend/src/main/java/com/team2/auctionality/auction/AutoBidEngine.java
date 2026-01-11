package com.team2.auctionality.auction;

import com.team2.auctionality.dto.AutoBidResult;
import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.email.EmailService;
import com.team2.auctionality.email.dto.BidNotificationEmailRequest;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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
    private final EmailService emailService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

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
            
            // Find previous highest bidder BEFORE creating the new bid
            Optional<Bid> previousHighestBidOpt = bidRepository.findHighestBid(productId);
            final String previousBidderEmail;
            final String previousBidderName;
            final Integer previousBidderId;
            
            if (previousHighestBidOpt.isPresent()) {
                Bid previousBid = previousHighestBidOpt.get();
                previousBidderId = previousBid.getBidder().getId();
                previousBidderEmail = previousBid.getBidder().getEmail();
                previousBidderName = previousBid.getBidder().getProfile() != null && previousBid.getBidder().getProfile().getFullName() != null
                        ? previousBid.getBidder().getProfile().getFullName()
                        : previousBid.getBidder().getEmail();
            } else {
                previousBidderId = null;
                previousBidderEmail = null;
                previousBidderName = null;
            }
            
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

            // Extract email data before transaction ends (to avoid lazy loading issues in callback)
            final String productUrl = frontendBaseUrl + "/products/" + productId;
            final String productTitle = product.getTitle();
            final String sellerEmail = product.getSeller().getEmail();
            final String bidderEmail = bid.getBidder().getEmail();
            final String bidderName = bid.getBidder().getProfile() != null && bid.getBidder().getProfile().getFullName() != null
                    ? bid.getBidder().getProfile().getFullName()
                    : bid.getBidder().getEmail();
            final Float bidAmount = bid.getAmount();
            final Integer bidId = bid.getId();
            final Integer newBidderId = bid.getBidder().getId();

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
                            
                            // Send email notifications
                            try {
                                log.info("Sending bid notification emails for product {} bid {} to seller {} and bidder {}", 
                                        finalProductId, bidId, sellerEmail, bidderEmail);
                                
                                // 1. Notify seller
                                emailService.sendBidSuccessNotification(
                                        new BidNotificationEmailRequest(
                                                sellerEmail,
                                                productTitle,
                                                productUrl,
                                                bidAmount,
                                                bidderName,
                                                BidNotificationEmailRequest.NotificationType.SELLER
                                        )
                                );
                                
                                // 2. Notify new highest bidder (the one who just placed the bid)
                                emailService.sendBidSuccessNotification(
                                        new BidNotificationEmailRequest(
                                                bidderEmail,
                                                productTitle,
                                                productUrl,
                                                bidAmount,
                                                bidderName,
                                                BidNotificationEmailRequest.NotificationType.NEW_HIGHEST_BIDDER
                                        )
                                );
                                
                                // 3. Notify previous highest bidder if they exist and are different from the new bidder
                                if (previousBidderEmail != null && previousBidderId != null && !previousBidderId.equals(newBidderId)) {
                                    log.info("Sending outbid notification to previous highest bidder {} for product {}", 
                                            previousBidderEmail, finalProductId);
                                    emailService.sendBidSuccessNotification(
                                            new BidNotificationEmailRequest(
                                                    previousBidderEmail,
                                                    productTitle,
                                                    productUrl,
                                                    bidAmount,
                                                    previousBidderName,
                                                    BidNotificationEmailRequest.NotificationType.PREVIOUS_BIDDER
                                            )
                                    );
                                }
                                
                                log.info("Successfully sent bid notification emails for product {} bid {}", finalProductId, bidId);
                            } catch (Exception e) {
                                log.error("Error sending bid notification emails for product {}: {}", finalProductId, e.getMessage(), e);
                                // Don't throw - email failures shouldn't break the bid placement
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
