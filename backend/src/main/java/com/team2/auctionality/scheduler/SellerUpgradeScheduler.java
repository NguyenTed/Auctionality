package com.team2.auctionality.scheduler;

import com.team2.auctionality.service.SellerUpgradeCleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SellerUpgradeScheduler {

    private final SellerUpgradeCleanupService cleanupService;

    // Run  everyday at 02:00 AM
//    @Scheduled(fixedRate = 60000)
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredSellerUpgradeRequests() {
        log.info("Start cleanup expired seller upgrade requests");
        cleanupService.cleanupExpiredApprovals();
    }
}

