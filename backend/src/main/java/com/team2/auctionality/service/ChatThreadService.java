package com.team2.auctionality.service;

import com.team2.auctionality.model.ChatThread;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.ChatThreadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatThreadService {
    private final ChatThreadRepository threadRepository;
    private final UserService userService;
    private final OrderService orderService;

    @Transactional
    public ChatThread getOrCreateThread(
            Integer orderId,
            Integer buyerId,
            Integer sellerId
    ) {
        Order order = orderService.getOrderById(orderId);
        User buyer = userService.getUserById(buyerId);
        User seller = userService.getUserById(sellerId);
        
        // Use findFirstByOrderIdOrderByCreatedAtAsc to handle potential duplicates
        // If multiple threads exist, use the first one (oldest)
        Optional<ChatThread> existingThread = threadRepository.findFirstByOrderIdOrderByCreatedAtAsc(orderId);
        
        if (existingThread.isPresent()) {
            return existingThread.get();
        }
        
        // No thread exists, create a new one
        // Use try-catch to handle race condition where another thread might create it simultaneously
        try {
            ChatThread thread = new ChatThread();
            thread.setOrderId(orderId);
            thread.setBuyerId(buyer.getId());
            thread.setSellerId(seller.getId());
            thread.setCreatedAt(new Date());
            return threadRepository.save(thread);
        } catch (DataIntegrityViolationException e) {
            // Another thread created it concurrently, fetch it
            log.warn("Chat thread for order {} was created concurrently, fetching existing one", orderId);
            return threadRepository.findFirstByOrderIdOrderByCreatedAtAsc(orderId)
                    .orElseThrow(() -> new RuntimeException("Failed to create or retrieve chat thread"));
        }
    }
}
