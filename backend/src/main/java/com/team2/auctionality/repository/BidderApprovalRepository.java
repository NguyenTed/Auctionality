package com.team2.auctionality.repository;

import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.model.BidderApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BidderApprovalRepository extends JpaRepository<BidderApproval,Integer> {
    Optional<BidderApproval> findByProductIdAndBidderId(Integer productId, Integer bidderId);
    
    @Query("""
        SELECT ba FROM BidderApproval ba
        JOIN Product p ON p.id = ba.productId
        WHERE p.seller.id = :sellerId
          AND ba.status = :status
        ORDER BY ba.createdAt DESC
    """)
    List<BidderApproval> findPendingBySellerId(@Param("sellerId") Integer sellerId, @Param("status") ApproveStatus status);
    
    default List<BidderApproval> findPendingBySellerId(Integer sellerId) {
        return findPendingBySellerId(sellerId, ApproveStatus.PENDING);
    }
}
