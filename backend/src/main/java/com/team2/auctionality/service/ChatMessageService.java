package com.team2.auctionality.service;

import com.team2.auctionality.exception.AuthException;
import com.team2.auctionality.model.ChatMessage;
import com.team2.auctionality.model.ChatThread;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.ChatMessageRepository;
import com.team2.auctionality.repository.ChatThreadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository messageRepository;
    private final ChatThreadService chatThreadService;
    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatMessage saveMessage(
            Integer orderId,
            User sender,
            String content
    ) {
        // Validate sender is not null
        if (sender == null || sender.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User not authenticated"
            );
        }
        Integer senderId = sender.getId();
        Order order = orderService.getOrderById(orderId);

        if (!senderId.equals(order.getBuyer().getId()) && !senderId.equals(order.getSeller().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "You are not allowed to chat in this order"
            );
        }
        ChatThread chatThread = chatThreadService.getOrCreateThread(orderId, order.getBuyer().getId(), order.getSeller().getId());

        ChatMessage message = new ChatMessage();
        message.setThreadId(chatThread.getId());
        message.setSenderId(sender.getId());
        message.setContent(content);
        message.setMessageType("TEXT");
        message.setIsRead(false);
        message.setCreatedAt(new Date());

        ChatMessage savedMessage = messageRepository.save(message);
        
        // Broadcast message to the thread's topic via WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + chatThread.getId(), savedMessage);
        
        return savedMessage;
    }

    public List<ChatMessage> getMessages(Integer threadId) {
        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }
}
