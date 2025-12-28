package com.team2.auctionality.service;

import com.team2.auctionality.email.EmailService;
import com.team2.auctionality.email.dto.AuctionEndedEmailRequest;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.model.Bid;
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
 * Sends email notifications when auctions end
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionEndMonitoringService {

    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final EmailService emailService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    /**
     * Check for ended auctions every minute
     * Only processes auctions that haven't been notified yet (status is still ACTIVE)
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void checkEndedAuctions() {
        LocalDateTime now = LocalDateTime.now();
        log.debug("Checking for ended auctions at {}", now);

        // Find all active products that have ended
        List<Product> endedProducts = productRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProductStatus.active)
                .filter(p -> p.getEndTime().isBefore(now) || p.getEndTime().isEqual(now))
                .toList();

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
     */
    private void processEndedAuction(Product product) {
        log.info("Processing ended auction: {} - {}", product.getId(), product.getTitle());

        // Update product status to expired
        product.setStatus(ProductStatus.expired);
        productRepository.save(product);

        String productUrl = frontendBaseUrl + "/products/" + product.getId();

        // Find the winning bid (highest bid)
        Optional<Bid> winnerBidOpt = bidRepository.findTopBidByProductId(product.getId());

        if (winnerBidOpt.isEmpty()) {
            // No bids - notify seller only
            log.info("Auction {} ended with no bids", product.getId());
            emailService.sendAuctionEndedNoBidsNotification(
                    product.getSeller().getEmail(),
                    product.getTitle(),
                    productUrl
            );
        } else {
            // Has winner - notify seller and winner
            Bid winnerBid = winnerBidOpt.get();
            String winnerName = winnerBid.getBidder().getProfile().getFullName();
            Float finalPrice = winnerBid.getAmount();

            log.info("Auction {} ended with winner: {} (€{})", 
                    product.getId(), winnerName, finalPrice);

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

