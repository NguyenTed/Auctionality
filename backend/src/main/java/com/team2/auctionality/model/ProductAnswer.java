package com.team2.auctionality.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "product_answer")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "question_id")
    private Integer questionId;

    @Column(name = "responder_id")
    private Integer responderId;

    @Column(name = "content")
    private String content;

    @Column(name = "created_at")
    private Date createdAt;
}
