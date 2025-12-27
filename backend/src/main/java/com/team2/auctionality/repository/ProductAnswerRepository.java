package com.team2.auctionality.repository;

import com.team2.auctionality.model.ProductAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductAnswerRepository extends JpaRepository<ProductAnswer,Integer> {
    @Query(
            value = """
        SELECT pa.*
        FROM product_answer pa
        JOIN product_question pq ON pa.question_id = pq.id
        WHERE pq.product_id = :productId
        """,
            nativeQuery = true
    )
    List<ProductAnswer> findByProductId(Integer productId);
}
