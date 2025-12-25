package com.team2.auctionality.repository;

import com.team2.auctionality.model.AutoBidConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutoBidConfigRepository extends JpaRepository<AutoBidConfig,Integer> {
    Optional<AutoBidConfig> findByProductIdAndBidderId(Integer productId, Integer id);

    List<AutoBidConfig> findByProductId(Integer productId);
}
