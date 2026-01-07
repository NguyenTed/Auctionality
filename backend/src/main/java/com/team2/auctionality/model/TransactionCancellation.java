package com.team2.auctionality.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "transaction_cancellation")
public class TransactionCancellation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id")
    private Integer orderId;

    @JoinColumn(name = "cancelled_by_user_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private User cancelledByUser;

    @Column(name = "reason")
    private String reason;

    @Column(name = "created_at")
    private Date createdAt;
}
