package com.team2.auctionality.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@EqualsAndHashCode(exclude = {"product", "bidder"})
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "bid")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JoinColumn(name = "product_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private Product product;

    @JoinColumn(name = "bidder_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private User bidder;

    @Column(name = "amount")
    private float amount;

    @Column(name = "is_auto_bid")
    private Boolean isAutoBid;

    @Column(name = "created_at")
    private Date createdAt;

}
