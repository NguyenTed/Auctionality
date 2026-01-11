package com.team2.auctionality.repository;

import com.team2.auctionality.dto.CreateProductDto;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.ProductTopMostBidDto;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @EntityGraph(attributePaths = {"images", "category"})
    @Override
    java.util.Optional<Product> findById(Integer id);

    // Note: Removed @EntityGraph from paginated queries to avoid Hibernate warning
    // Images and category will be batch fetched using @BatchSize on Product entity
    @Override
    org.springframework.data.domain.Page<Product> findAll(org.springframework.data.domain.Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("""
        SELECT p FROM Product p
        WHERE p.endTime > CURRENT_TIMESTAMP
        ORDER BY p.endTime ASC
        """)
    List<Product> findTop5EndingSoon(Pageable pageable);

    // Same pattern as findTop5EndingSoon - only fetch images and category
    // Bid count is calculated using SIZE() in ORDER BY (doesn't require fetching bids)
    @EntityGraph(attributePaths = {"images", "category"})
    @Query("""
        SELECT p FROM Product p
        ORDER BY SIZE(p.bids) DESC
        """)
    List<Product> findTop5MostBid(Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category"})
    @Query("""
        SELECT p FROM Product p
        WHERE p.endTime >= CURRENT_TIMESTAMP
        ORDER BY p.currentPrice DESC
        """)
    List<Product> findTop5HighestPrice(Pageable pageable);


    // Removed @EntityGraph to avoid Hibernate warning with pagination
    // Images and category will be batch fetched using @BatchSize on Product entity
    @Query(
            value = """
                SELECT p.* 
                FROM product p
                LEFT JOIN category c ON p.category_id = c.id
                WHERE p.category_id = :categoryId OR c.parent_id = :categoryId
            """,
            countQuery = """
                SELECT COUNT(*) 
                FROM product p
                LEFT JOIN category c ON p.category_id = c.id
                WHERE p.category_id = :categoryId OR c.parent_id = :categoryId
            """,
            nativeQuery = true
    )
    Page<Product> findByCategory(@Param("categoryId") Integer categoryId, Pageable pageable);

    // Removed @EntityGraph to avoid Hibernate warning with pagination
    // Images and category will be batch fetched using @BatchSize on Product entity
    @Query(
        """
        SELECT p FROM Product p
        WHERE 
            (:categoryId IS NULL OR p.category.id = :categoryId OR p.category.parent.id = :categoryId)
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

    @Query(value = """
        SELECT DISTINCT p.*
        FROM product p
        JOIN auto_bid_config a ON a.product_id = p.id
        WHERE a.bidder_id = :userId
        """, nativeQuery = true)
    List<Product> findProductsUserHasBidOn(@Param("userId") Integer userId);

    @Query(value = """
        SELECT p.*
        FROM "order" o
        JOIN product p ON p.id = o.product_id
        WHERE o.buyer_id = :userId
        """, nativeQuery = true)
    List<Product> findWonProductsByUserId(@Param("userId") Integer userId);

    @Query("""
    SELECT p
    FROM Product p
    WHERE p.endTime <= :now
      AND p.status = 'ACTIVE'
      AND NOT EXISTS (
          SELECT o
          FROM Order o
          WHERE o.product.id = p.id
      )
""")
    List<Product> findExpiredAndNotOrdered(LocalDateTime now);

    @EntityGraph(attributePaths = {"images", "category", "seller"})
    @Query("""
        SELECT p FROM Product p
        WHERE p.category.id = :categoryId
          AND p.id != :excludeProductId
          AND p.status = 'ACTIVE'
        ORDER BY p.createdAt DESC
    """)
    List<Product> findRelatedProducts(@Param("categoryId") Integer categoryId, 
                                      @Param("excludeProductId") Integer excludeProductId, 
                                      Pageable pageable);

    long countByCategoryId(Integer categoryId);
    
    long countByStatus(ProductStatus status);
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.endTime BETWEEN :start AND :end")
    long countByEndTimeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Find products by seller
    @EntityGraph(attributePaths = {"images", "category"})
    Page<Product> findBySellerId(Integer sellerId, Pageable pageable);

    // Find products by seller with search by title
    @Query("""
        SELECT p FROM Product p
        WHERE p.seller.id = :sellerId
            AND (
                :keyword IS NULL 
                OR LOWER(FUNCTION('unaccent', p.title)) LIKE LOWER(CONCAT('%', FUNCTION('unaccent', CAST(:keyword AS string)), '%'))
            )
        """)
    Page<Product> findBySellerIdAndTitleContaining(
            @Param("sellerId") Integer sellerId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * Count products by seller ID
     */
    long countBySellerId(Integer sellerId);
}

