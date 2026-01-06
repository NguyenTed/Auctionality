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
import org.springframework.stereotype.Controller;

@Controller
@Tag(name = "Chat", description = "Chat socket")
@RequiredArgsConstructor
@Slf4j
public class ChatSocketController {
    private final ChatMessageService messageService;

    @MessageMapping("/chat.send/{orderId}")
    @SendTo("/topic/chat/{orderId}")
    public ChatMessage sendMessage(
            @DestinationVariable Integer orderId,
            ChatMessageRequest request,
            @CurrentUser User user
    ) {
        System.out.println("DCMMMMMMMMMMMMM");

        return messageService.saveMessage(
                orderId,
                user,
                request.getContent()
        );
    }
}
