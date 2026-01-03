package com.team2.auctionality.controller;

import com.team2.auctionality.model.ChatMessage;
import com.team2.auctionality.model.ChatThread;
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
}
