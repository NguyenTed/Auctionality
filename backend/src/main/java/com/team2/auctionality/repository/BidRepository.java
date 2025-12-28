package com.team2.auctionality.repository;

import com.team2.auctionality.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid,Integer> {
    List<Bid> findByProductIdOrderByCreatedAtDesc(Integer productId);

    Optional<Bid> findTopByProductIdOrderByAmountDescCreatedAtAsc(Integer productId);

    @Query(
            value = """
        SELECT b.*
        FROM bid b
        WHERE b.product_id = :productId
          AND NOT EXISTS (
              SELECT 1
              FROM rejected_bidder r
              WHERE r.product_id = :productId
                AND r.bidder_id = b.bidder_id
          )
        ORDER BY b.amount DESC, b.created_at ASC
        """,
            nativeQuery = true
    )
    List<Bid> findValidBids(@Param("productId") Integer productId);

    @Query("""
    SELECT b
    FROM Bid b
    WHERE b.product.id = :productId
    ORDER BY b.amount DESC, b.createdAt ASC
    """)
    Optional<Bid> findTopBidByProductId(Integer productId);

    @Query(
            value = """
        SELECT *
        FROM bid b
        WHERE b.product_id = :productId
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1
    """,
            nativeQuery = true
    )
    Optional<Bid> findHighestBid(@Param("productId") Integer productId);
}
