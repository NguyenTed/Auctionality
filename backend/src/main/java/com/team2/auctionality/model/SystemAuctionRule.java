package com.team2.auctionality.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "system_auction_rule")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SystemAuctionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "time_threshold_minutes")
    private Integer timeThresholdMinutes;

    @Column(name = "extension_minutes")
    private Integer extensionMinutes;

    @Column(name = "is_active")
    private Boolean isActive;

}
