package com.team2.auctionality.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "product_extra_description")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductExtraDescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "content")
    private String content;

    @Column(name = "createdAt")
    private Date createdAt;
}
