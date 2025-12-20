package com.team2.auctionality.repository;

import com.team2.auctionality.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Integer> {
}
