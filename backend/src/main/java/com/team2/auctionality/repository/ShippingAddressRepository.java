package com.team2.auctionality.repository;

import com.team2.auctionality.model.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Integer> {
    Optional<ShippingAddress> findByOrderId(Integer orderId);
}
