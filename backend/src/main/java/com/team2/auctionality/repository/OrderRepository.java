package com.team2.auctionality.repository;

import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    Optional<Order> findByProduct(Product product);

    Optional<Order> findByProductIdAndBuyerId(Integer productId, Integer id);

    @Query("""
        SELECT o
        FROM Order o
        WHERE 
            (:isSeller = true AND o.seller = :user)
            OR
            (:isSeller = false AND o.buyer = :user)
    """)
    Page<Order> findOrders(User user, Boolean isSeller, Pageable pageable);
}
