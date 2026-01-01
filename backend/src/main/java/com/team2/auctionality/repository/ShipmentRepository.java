package com.team2.auctionality.repository;

import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {
    Optional<Shipment> findByOrderId(Integer id);
}
