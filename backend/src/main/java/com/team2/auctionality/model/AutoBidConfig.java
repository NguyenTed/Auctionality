package com.team2.auctionality.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "auto_bid_config")
public class AutoBidConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "bidder_id")
    private Integer bidderid;

    @Column(name = "max_price")
    private float maxPrice;

    @Column(name = "created_at")
    private Date createdAt;
}
