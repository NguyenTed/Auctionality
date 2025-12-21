package com.team2.auctionality.repository;

import com.team2.auctionality.model.ProductExtraDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductExtraDescriptionRepository extends JpaRepository<ProductExtraDescription, Integer> {
    List<ProductExtraDescription> getProductExtraDescriptionByProductId(Integer productId);
}
