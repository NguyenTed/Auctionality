package com.team2.auctionality.repository;

import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.ProductQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Optional;

@Repository
public interface ProductQuestionRepository extends JpaRepository<ProductQuestion, Integer> {

    List<ProductQuestion> findByProductId(Integer productId);
}
