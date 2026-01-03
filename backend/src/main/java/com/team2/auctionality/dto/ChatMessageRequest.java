package com.team2.auctionality.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private Integer threadId;
    private String content;
}
