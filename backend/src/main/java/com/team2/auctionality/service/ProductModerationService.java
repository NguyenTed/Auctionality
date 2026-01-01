package com.team2.auctionality.service;

import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.ProductModeration;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.ProductModerationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for logging product moderation actions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductModerationService {

    private final ProductModerationRepository productModerationRepository;

    /**
     * Log a product moderation action (e.g., removal, takedown)
     * 
     * @param product The product being moderated
     * @param admin The admin performing the action
     * @param action The action type (e.g., "REMOVE", "TAKE_DOWN", "RESTORE")
     * @param reason Optional reason for the action
     */
    @Async
    @Transactional
    public void logModerationAction(Product product, User admin, String action, String reason) {
        try {
            ProductModeration moderation = ProductModeration.builder()
                    .product(product)
                    .admin(admin)
                    .action(action)
                    .reason(reason)
                    .createdAt(LocalDateTime.now())
                    .build();

            productModerationRepository.save(moderation);
            log.info("Product moderation logged: product={}, admin={}, action={}", 
                    product.getId(), admin.getId(), action);
        } catch (Exception e) {
            log.error("Failed to save product moderation log: product={}, admin={}, action={}", 
                    product != null ? product.getId() : "null", 
                    admin != null ? admin.getId() : "null", 
                    action, e);
        }
    }

    /**
     * Get moderation history for a product
     */
    @Transactional(readOnly = true)
    public List<ProductModeration> getModerationHistory(Integer productId) {
        return productModerationRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    /**
     * Get moderation history for an admin
     */
    @Transactional(readOnly = true)
    public Page<ProductModeration> getModerationHistoryByAdmin(Integer adminId, Pageable pageable) {
        return productModerationRepository.findByAdminIdOrderByCreatedAtDesc(adminId, pageable);
    }

    /**
     * Get moderation history for a product (paginated)
     */
    @Transactional(readOnly = true)
    public Page<ProductModeration> getModerationHistory(Integer productId, Pageable pageable) {
        return productModerationRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }
}

