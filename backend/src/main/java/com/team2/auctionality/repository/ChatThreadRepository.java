package com.team2.auctionality.repository;

import com.team2.auctionality.model.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, Integer> {
    Optional<ChatThread> findByOrderId(Integer orderId);
}
