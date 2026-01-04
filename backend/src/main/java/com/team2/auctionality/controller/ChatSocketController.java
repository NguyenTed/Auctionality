package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.ChatMessageRequest;
import com.team2.auctionality.model.ChatMessage;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.ChatMessageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

@Controller
@Tag(name = "Chat", description = "Chat socket")
@RequiredArgsConstructor
@Slf4j
public class ChatSocketController {
    private final ChatMessageService messageService;

    @MessageMapping("/chat.send/{orderId}")
    public ChatMessage sendMessage(
            @DestinationVariable Integer orderId,
            ChatMessageRequest request,
            @CurrentUser User user
    ) {
        // Fallback: Get user from SecurityContext if @CurrentUser didn't work
        User authenticatedUser = user;
        if (authenticatedUser == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) {
                authenticatedUser = (User) auth.getPrincipal();
                log.info("Got user from SecurityContext: {}", authenticatedUser.getId());
            } else {
                log.error("User is null in WebSocket message handler. Auth: {}, Principal: {}", 
                    auth != null ? auth.getClass().getName() : "null",
                    auth != null && auth.getPrincipal() != null ? auth.getPrincipal().getClass().getName() : "null");
                throw new RuntimeException("User not authenticated");
            }
        }
        
        log.info("Received WebSocket message for order {} from user {}", orderId, authenticatedUser.getId());
        
        // Save message and broadcast via WebSocket (handled in service)
        return messageService.saveMessage(
                orderId,
                authenticatedUser,
                request.getContent()
        );
    }
}
