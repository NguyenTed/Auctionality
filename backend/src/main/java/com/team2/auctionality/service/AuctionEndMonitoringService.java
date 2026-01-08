package com.team2.auctionality.service;

import com.team2.auctionality.email.EmailService;
import com.team2.auctionality.email.dto.AuctionEndedEmailRequest;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.model.Bid;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.repository.BidRepository;
import com.team2.auctionality.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service to monitor and handle ended auctions
 * Consolidates auction finalization (order creation) and email notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionEndMonitoringService {

    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final EmailService emailService;
    private final OrderService orderService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    /**
     * Check for ended auctions every minute
     * Processes auctions that have ended but haven't been finalized yet
     * Handles both order creation and email notifications
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void finalizeEndedAuctions() {
        LocalDateTime now = LocalDateTime.now();
        log.debug("Checking for ended auctions at {}", now);

        // Find all active products that have ended and don't have orders yet
        List<Product> endedProducts = productRepository.findExpiredAndNotOrdered(now);

        if (endedProducts.isEmpty()) {
            return;
        }

        log.info("Found {} ended auction(s) to process", endedProducts.size());

        for (Product product : endedProducts) {
            try {
                processEndedAuction(product);
            } catch (Exception e) {
                log.error("Error processing ended auction {}: {}", product.getId(), e.getMessage(), e);
            }
        }
    }

    /**
     * Process a single ended auction
     * Handles order creation and email notifications
     */
    private void processEndedAuction(Product product) {
        log.info("Processing ended auction: {} - {}", product.getId(), product.getTitle());

        // Update product status to expired
        product.setStatus(ProductStatus.ENDED);
        productRepository.save(product);

        String productUrl = frontendBaseUrl + "/products/" + product.getId();

        // Find the winning bid (highest bid)
        Optional<Bid> winnerBidOpt = bidRepository.findHighestBid(product.getId());

        if (winnerBidOpt.isEmpty()) {
            // No bids - notify seller only
            log.info("Auction {} ended with no bids", product.getId());
            emailService.sendAuctionEndedNoBidsNotification(
                    product.getSeller().getEmail(),
                    product.getTitle(),
                    productUrl
            );
        } else {
            // Has winner - create order and send notifications
            Bid winnerBid = winnerBidOpt.get();
            
            if (winnerBid.getBidder() == null) {
                log.error("Winner bid {} has null bidder for product {}", 
                        winnerBid.getId(), product.getId());
                return;
            }
            
            String winnerName = winnerBid.getBidder().getProfile() != null
                    ? winnerBid.getBidder().getProfile().getFullName()
                    : winnerBid.getBidder().getEmail();
            Float finalPrice = winnerBid.getAmount();

            log.info("Auction {} ended with winner: {} (€{})", 
                    product.getId(), winnerName, finalPrice);

            // Create order for the winner
            Order order = orderService.createOrderForBuyNow(
                    product,
                    winnerBid.getBidder().getId(),
                    finalPrice
            );
            log.info("Created order {} for product {}", order.getId(), product.getId());

            // Notify seller
            emailService.sendAuctionEndedWithWinnerNotification(
                    new AuctionEndedEmailRequest(
                            product.getSeller().getEmail(),
                            product.getTitle(),
                            productUrl,
                            finalPrice,
                            winnerName,
                            true
                    )
            );

            // Notify winner
            emailService.sendAuctionEndedWithWinnerNotification(
                    new AuctionEndedEmailRequest(
                            winnerBid.getBidder().getEmail(),
                            product.getTitle(),
                            productUrl,
                            finalPrice,
                            winnerName,
                            true
                    )
            );
        }
    }
}

