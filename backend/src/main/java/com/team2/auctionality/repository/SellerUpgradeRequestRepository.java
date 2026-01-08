package com.team2.auctionality.repository;

import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.model.SellerUpgradeRequest;
import com.team2.auctionality.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface SellerUpgradeRequestRepository extends JpaRepository<SellerUpgradeRequest, Integer> {
    List<SellerUpgradeRequest> findByStatus(ApproveStatus status);

    boolean existsByUserAndStatus(User user, ApproveStatus status);
    
    long countByStatus(ApproveStatus status);

    @Query("""
        SELECT r
        FROM SellerUpgradeRequest r
        WHERE r.status = :status
          AND r.processedAt <= :expiredTime
    """)
    List<SellerUpgradeRequest> findExpiredApprovedRequests(
            @Param("status") ApproveStatus status,
            @Param("expiredTime") Date expiredTime
    );
}
