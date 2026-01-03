package com.team2.auctionality.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "chat_message")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "thread_id")
    private Integer threadId;

    @Column(name = "sender_id")
    private Integer senderId;

    private String content;

    @Column(name = "message_type")
    private String messageType; // TEXT, IMAGE...

    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "created_at")
    private Date createdAt;
}
