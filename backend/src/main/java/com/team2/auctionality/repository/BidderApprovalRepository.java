package com.team2.auctionality.repository;

import com.team2.auctionality.model.BidderApproval;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BidderApprovalRepository extends JpaRepository<BidderApproval,Integer> {
    Optional<BidderApproval> findByProductIdAndBidderId(Integer productId, Integer bidderId);

    @Query(
        value = """
            SELECT *
            FROM bidder_approval
            WHERE product_id = :productId
            ORDER BY status ASC, created_at DESC
        """,
        countQuery = """
            SELECT COUNT(*)
            FROM bidder_approval
            WHERE product_id = :productId
        """,
            nativeQuery = true
    )
    Page<BidderApproval> getBidderApprovalByProductId(
            @Param("productId") Integer productId,
            Pageable pageable
    );
}
