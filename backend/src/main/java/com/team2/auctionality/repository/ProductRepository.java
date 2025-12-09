package com.team2.auctionality.repository;

import com.team2.auctionality.dto.ProductTopMostBidDto;
import com.team2.auctionality.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query(
            value = """
            SELECT * 
            FROM product 
            WHERE end_time > NOW() 
            ORDER BY end_time ASC
        """,
            nativeQuery = true
    )
    List<Product> findTop5EndingSoon(Pageable pageable);

    @Query("""
    SELECT new com.team2.auctionality.dto.ProductTopMostBidDto(
        p.id,
        p.title,
        p.status,
        p.startPrice,
        p.currentPrice,
        p.buyNowPrice,
        p.bidIncrement,
        p.startTime,
        p.endTime,
        p.autoExtensionEnabled,
        p.seller.id,
        c.id,
        c.name,
        c.slug,
        COUNT(b)
    )
    FROM Product p
    LEFT JOIN p.bids b
    LEFT JOIN p.category c
    GROUP BY 
        p.id, p.title, p.status,
        p.startPrice, p.currentPrice, p.buyNowPrice,
        p.bidIncrement, p.startTime, p.endTime, p.autoExtensionEnabled,
        p.seller.id,
        c.id, c.name, c.slug
    ORDER BY COUNT(b) DESC
    """)
    List<ProductTopMostBidDto> findTop5MostBid(Pageable pageable);

    @Query(
            value = """
            SELECT * 
            FROM product
            ORDER BY current_price DESC
        """,
            nativeQuery = true
    )
    List<Product> findTop5HighestPrice(Pageable pageable);


    @Query(
            value = """
            SELECT * 
            FROM product
            WHERE category_id = :categoryId
        """,
            countQuery = """
            SELECT COUNT(*) 
            FROM product
            WHERE category_id = :categoryId
        """,
            nativeQuery = true
    )

    Page<Product> findByCategory(@Param("categoryId") Integer categoryId, Pageable pageable);

    @Query(
        """
        SELECT p FROM Product p
        WHERE 
            (:categoryId IS NULL OR p.category.id = :categoryId)
            AND (
                :keyword IS NULL 
                OR LOWER(FUNCTION('unaccent', p.title)) LIKE LOWER(CONCAT('%', FUNCTION('unaccent', CAST(:keyword AS string)), '%'))
            )
        """
    )
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            Pageable pageable
    );
}

