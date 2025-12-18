package com.team2.auctionality.repository;

import com.team2.auctionality.model.BidderApproval;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BidderApprovalRepository extends JpaRepository<BidderApproval,Integer> {
}
