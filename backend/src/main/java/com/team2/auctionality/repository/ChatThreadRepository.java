package com.team2.auctionality.repository;

import com.team2.auctionality.model.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, Integer> {
    List<ChatThread> findByOrderId(Integer orderId);
    
    // Get the first thread for an order (in case of duplicates)
    // Using Spring Data method naming - automatically limits to 1 result
    Optional<ChatThread> findFirstByOrderIdOrderByCreatedAtAsc(Integer orderId);
}
