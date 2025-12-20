package com.team2.auctionality.model;

import com.team2.auctionality.enums.ApproveStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "seller_upgrade_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerUpgradeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_admin_id", nullable = false)
    private User processedByAdmin;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ApproveStatus status;

    @Column(name = "requested_at")
    private Date requestedAt;

    @Column(name = "processed_at")
    private Date processedAt;
}
