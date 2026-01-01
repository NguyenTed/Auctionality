package com.team2.auctionality.repository;

import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.model.SellerUpgradeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerUpgradeRequestRepository extends JpaRepository<SellerUpgradeRequest, Integer> {
    List<SellerUpgradeRequest> findByStatus(ApproveStatus status);
    
    long countByStatus(ApproveStatus status);
}
