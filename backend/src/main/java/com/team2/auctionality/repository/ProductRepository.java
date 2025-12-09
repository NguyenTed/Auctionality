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
import java.util.Map;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    // Top 5 gần kết thúc (chưa kết thúc)
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
        p.name,
        p.description,
        p.startPrice,
        p.currentPrice,
        p.createdAt,
        p.endTime,
        p.seller.id,
        c.id,
        c.name,
        c.slug,
        sc.id,
        sc.name,
        sc.slug,
        COUNT(b)
    )
    FROM Product p
    LEFT JOIN p.bids b
    LEFT JOIN p.category c
    LEFT JOIN p.subcategory sc
    GROUP BY 
        p.id, p.name, p.description,
        p.startPrice, p.currentPrice,
        p.createdAt, p.endTime,
        p.seller.id,
        c.id, c.name, c.slug,
        sc.id, sc.name, sc.slug
    ORDER BY COUNT(b) DESC
    """)
    List<ProductTopMostBidDto> findTop5MostBid(Pageable pageable);


    // Top 5 có giá hiện tại cao nhất
    @Query(
            value = """
            SELECT * 
            FROM product
            ORDER BY current_price DESC
        """,
            nativeQuery = true
    )
    List<Product> findTop5HighestPrice(Pageable pageable);


    // Product theo category + phân trang
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
}

