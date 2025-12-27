package com.team2.auctionality.repository;

import com.team2.auctionality.model.RejectedBidder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RejectedBidderRepository extends JpaRepository<RejectedBidder, Integer> {
    boolean existsByProductIdAndBidderId(Integer productId, Integer bidderId);

    Optional<RejectedBidder> findByProductIdAndBidderId(Integer productId, Integer bidderId);
}
