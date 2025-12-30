package com.team2.auctionality.auction;

import com.team2.auctionality.dto.AutoBidResult;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.AutoBidConfigRepository;
import com.team2.auctionality.repository.BidRepository;
import com.team2.auctionality.repository.ProductRepository;
import com.team2.auctionality.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public AutoBidResult recalculate(Integer productId) {
        log.debug("Recalculating auto-bid for product: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Check if product has already ended
        if (product.getEndTime().isBefore(LocalDateTime.now()) || 
            product.getStatus() == ProductStatus.ENDED) {
            log.debug("Product {} has already ended, skipping recalculation", productId);
            return new AutoBidResult(false, null);
        }

        List<AutoBidConfig> bidders =
                autoBidConfigRepository.findByProductId(productId);

        if (bidders.isEmpty()) {
            return new AutoBidResult(false, null);
        }

        // Filter out rejected bidders
        bidders = bidders.stream()
                .filter(config -> {
                    // Check if bidder is rejected (this should be handled by repository query ideally)
                    return true; // For now, we'll rely on the bid validation in BidService
                })
                .toList();

        if (bidders.isEmpty()) {
            return new AutoBidResult(false, null);
        }

        // Sort: maxPrice desc, createdAt asc (earlier bidder wins on tie)
        bidders.sort(
                Comparator
                        .comparing(AutoBidConfig::getMaxPrice).reversed()
                        .thenComparing(AutoBidConfig::getCreatedAt)
        );

        AutoBidConfig winnerConfig = bidders.get(0);
        Float newPrice;

        if (bidders.size() == 1) {
            // Single bidder: price should be start price (no increment needed yet)
            newPrice = product.getStartPrice();
        } else {
            // Multiple bidders: winner pays second-highest max + increment, but not more than their max
            AutoBidConfig second = bidders.get(1);
            Float secondMaxPrice = second.getMaxPrice();
            Float winnerMaxPrice = winnerConfig.getMaxPrice();
            Float increment = product.getBidIncrement();
            
            newPrice = Math.min(secondMaxPrice + increment, winnerMaxPrice);
        }

        // Ensure new price is at least start price
        if (newPrice < product.getStartPrice()) {
            newPrice = product.getStartPrice();
        }

        // Price not changed -> nothing to do
        if (product.getCurrentPrice() != null &&
                Math.abs(product.getCurrentPrice() - newPrice) < 0.01f) {
            return new AutoBidResult(false, null);
        }

        // Update product price
        product.setCurrentPrice(newPrice);
        productRepository.save(product);

        // Generate bid history entry
        User winner = userService.getUserById(winnerConfig.getBidderId());
        Bid bid = Bid.builder()
                .product(product)
                .bidder(winner)
                .amount(newPrice)
                .isAutoBid(true)
                .createdAt(new Date())
                .build();

        bidRepository.save(bid);
        log.debug("Created auto-bid for product {}: bidder {} bid {}", 
                productId, winner.getId(), newPrice);

        // Check if buy-now price is reached
        if (product.getBuyNowPrice() != null &&
                newPrice.compareTo(product.getBuyNowPrice()) >= 0) {
            log.info("Buy-now price reached for product {}, ending auction", productId);
            
            // End auction
            product.setEndTime(LocalDateTime.now());
            product.setStatus(ProductStatus.ENDED);
            productRepository.save(product);

            // Create order with buy-now price (not the bid price)
            Order order = orderService.createOrderForBuyNow(
                    product,
                    winnerConfig.getBidderId(),
                    product.getBuyNowPrice()  // Use buy-now price, not bid price
            );
            log.info("Created order {} for buy-now purchase of product {}", 
                    order.getId(), productId);

            return new AutoBidResult(true, bid);
        }

        // Auto-extension: if product's endTime <= timeThreshold, extend by extension minutes
        if (product.getAutoExtensionEnabled() != null && product.getAutoExtensionEnabled()) {
            systemAuctionRuleService.getActiveRule().ifPresent(rule -> {
                LocalDateTime now = LocalDateTime.now();
                long minutesToEnd = java.time.Duration
                        .between(now, product.getEndTime())
                        .toMinutes();

                if (minutesToEnd <= rule.getTimeThresholdMinutes()) {
                    LocalDateTime newEndTime = product.getEndTime()
                            .plusMinutes(rule.getExtensionMinutes());
                    product.setEndTime(newEndTime);
                    productService.save(product);
                    log.debug("Extended auction end time for product {} by {} minutes", 
                            productId, rule.getExtensionMinutes());
                }
            });
        }

        return new AutoBidResult(true, bid);
    }
}
