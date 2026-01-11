package com.team2.auctionality.repository;

import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.User;
import com.team2.auctionality.model.WatchListItem;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WatchListItemRepository extends JpaRepository<WatchListItem, Integer> {
    Optional<WatchListItem> findByUserAndProduct(User user, Product product);

    @Modifying
    @Transactional
    int deleteByUserIdAndProductId(Integer userId, Integer productId);

    List<WatchListItem> findByUser(User user);

    @Query("""
        SELECT w FROM WatchListItem w
        WHERE w.user.id = :userId
            AND (:categoryId IS NULL OR w.product.category.id = :categoryId OR w.product.category.parent.id = :categoryId)
            AND (
                :keyword IS NULL 
                OR LOWER(FUNCTION('unaccent', w.product.title)) LIKE LOWER(CONCAT('%', FUNCTION('unaccent', CAST(:keyword AS string)), '%'))
            )
        ORDER BY w.createdAt DESC
        """)
    Page<WatchListItem> findByUserWithFilters(
            @Param("userId") Integer userId,
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            Pageable pageable
    );
}
