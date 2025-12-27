package com.team2.auctionality.repository;

import com.team2.auctionality.model.BidderApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BidderApprovalRepository extends JpaRepository<BidderApproval,Integer> {
    Optional<BidderApproval> findByProductIdAndBidderId(Integer productId, Integer bidderId);
}
