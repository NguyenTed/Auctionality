package com.team2.auctionality.repository;

import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    Optional<Order> findByProduct(Product product);

    Optional<Order> findByProductIdAndBuyerId(Integer productId, Integer id);
}
