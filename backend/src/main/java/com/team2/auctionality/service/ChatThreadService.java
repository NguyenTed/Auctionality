package com.team2.auctionality.service;

import com.team2.auctionality.model.ChatThread;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.ChatThreadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class ChatThreadService {
    private final ChatThreadRepository threadRepository;
    private final UserService userService;
    private final OrderService orderService;

    public ChatThread getOrCreateThread(
            Integer orderId,
            Integer buyerId,
            Integer sellerId
    ) {
        Order order = orderService.getOrderById(orderId);
        User buyer = userService.getUserById(buyerId);
        User seller = userService.getUserById(sellerId);
        return threadRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    ChatThread thread = new ChatThread();
                    thread.setOrderId(orderId);
                    thread.setBuyerId(buyer.getId());
                    thread.setSellerId(seller.getId());
                    thread.setCreatedAt(new Date());
                    return threadRepository.save(thread);
                });
    }
}
