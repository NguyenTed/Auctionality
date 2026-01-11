package com.team2.auctionality.service;

import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.model.Role;
import com.team2.auctionality.model.SellerUpgradeRequest;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.RoleRepository;
import com.team2.auctionality.repository.SellerUpgradeRequestRepository;
import com.team2.auctionality.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SellerUpgradeCleanupService {

    private final SellerUpgradeRequestRepository requestRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Transactional
    public void cleanupExpiredApprovals() {

        Date expiredTime = Date.from(
                LocalDateTime.now()
                        .minusMinutes(1)
                        .atZone(ZoneId.systemDefault())
                        .toInstant()
        );

//        Date expiredTime = Date.from(
//                LocalDateTime.now()
//                        .minusDays(7)
//                        .atZone(ZoneId.systemDefault())
//                        .toInstant()
//        );

        List<SellerUpgradeRequest> expiredRequests =
                requestRepository.findExpiredApprovedRequests(
                        ApproveStatus.APPROVED,
                        expiredTime
                );

        if (expiredRequests.isEmpty()) {
            return;
        }

        Role sellerRole = roleRepository.findByName("SELLER")
                .orElseThrow(() -> new EntityNotFoundException("SELLER role not found"));

        Role bidderRole = roleRepository.findByName("BUYER")
                .orElseThrow(() -> new EntityNotFoundException("BUYER role not found"));

        for (SellerUpgradeRequest request : expiredRequests) {
            User user = request.getUser();

            // remove SELLER
            user.getRoles().remove(sellerRole);

            // add BIDDER
            if (!user.getRoles().contains(bidderRole)) {
                user.getRoles().add(bidderRole);
            }

            userRepository.save(user);

            // delete upgrade seller request approval
            requestRepository.delete(request);

            log.info("Rollback SELLER -> BIDDER for user {}", user.getId());
        }
    }
}