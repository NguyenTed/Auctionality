package com.team2.auctionality.repository;

import com.team2.auctionality.model.ProductModeration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductModerationRepository extends JpaRepository<ProductModeration, Integer> {
    Page<ProductModeration> findByProductIdOrderByCreatedAtDesc(Integer productId, Pageable pageable);
    
    Page<ProductModeration> findByAdminIdOrderByCreatedAtDesc(Integer adminId, Pageable pageable);
    
    @Query("SELECT pm FROM ProductModeration pm WHERE pm.product.id = :productId ORDER BY pm.createdAt DESC")
    List<ProductModeration> findByProductIdOrderByCreatedAtDesc(@Param("productId") Integer productId);
}

