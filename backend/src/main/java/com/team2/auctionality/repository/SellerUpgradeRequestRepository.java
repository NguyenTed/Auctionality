package com.team2.auctionality.repository;

import com.team2.auctionality.model.SellerUpgradeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SellerUpgradeRequestRepository extends JpaRepository<SellerUpgradeRequest, Integer> {
}
