package com.team2.auctionality.repository;

import com.team2.auctionality.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    List<ChatMessage> findByThreadIdOrderByCreatedAtAsc(Integer threadId);
}
