package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.ChatMessageRequest;
import com.team2.auctionality.model.ChatMessage;
import com.team2.auctionality.model.ChatThread;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.ChatMessageService;
import com.team2.auctionality.service.ChatThreadService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatThreadService threadService;
    private final ChatMessageService messageService;

    @PostMapping("/thread")
    public ChatThread createThread(@RequestParam Integer orderId,
                                   @RequestParam Integer buyerId,
                                   @RequestParam Integer sellerId) {
        return threadService.getOrCreateThread(orderId, buyerId, sellerId);
    }

    @GetMapping("/messages/{threadId}")
    public List<ChatMessage> getMessages(@PathVariable Integer threadId) {
        return messageService.getMessages(threadId);
    }

    @PostMapping("/messages")
    public ChatMessage sendMessage(
            @RequestBody ChatMessageRequest request,
            @CurrentUser User user
    ) {
        // request.getThreadId() is actually the orderId
        // We need to get the thread to validate access
        // For now, we'll use a simpler approach: pass orderId directly
        // The service will get or create the thread internally
        return messageService.saveMessage(request.getThreadId(), user, request.getContent());
    }
}
