package com.team2.auctionality.repository;

import com.team2.auctionality.model.SystemAuctionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemAuctionRuleRepository extends JpaRepository<SystemAuctionRule, Integer> {
}
