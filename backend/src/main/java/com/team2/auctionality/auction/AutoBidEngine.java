package com.team2.auctionality.auction;

import com.team2.auctionality.dto.AutoBidResult;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.AutoBidConfigRepository;
import com.team2.auctionality.repository.BidRepository;
import com.team2.auctionality.repository.ProductRepository;
import com.team2.auctionality.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
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

        // price not changed -> nothing to do
        if (product.getCurrentPrice() != null &&
                product.getCurrentPrice().compareTo(newPrice) == 0) {
            return new AutoBidResult(false, null);
        }

        // update product
        product.setCurrentPrice(newPrice);
        productRepository.save(product);

        // generate bid history
        Bid bid = Bid.builder()
                .product(product)
                .bidder(userService.getUserById(winnerConfig.getBidderId()))
                .amount(newPrice)
                .isAutoBid(true)
                .createdAt(new Date())
                .build();

        bidRepository.save(bid);

        if (product.getBuyNowPrice() != null &&
                newPrice.compareTo(product.getBuyNowPrice()) == 0) {

            // End auction
            product.setEndTime(LocalDateTime.now());
            product.setStatus(ProductStatus.expired);
            productRepository.save(product);

            // Create order
            Order order = orderService.createOrderForBuyNow(
                    product,
                    winnerConfig.getBidderId(),
                    newPrice
            );


            return new AutoBidResult(true, bid);
        }


        // If product's endTime <= timeThreshold --> plus extension minutes.
        systemAuctionRuleService.getActiveRule().ifPresent(rule -> {

            long minutesToEnd = java.time.Duration
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
