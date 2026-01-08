package com.team2.auctionality.repository;

import com.team2.auctionality.model.TransactionCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionCancellationRepository extends JpaRepository<TransactionCancellation, Integer> {
}
