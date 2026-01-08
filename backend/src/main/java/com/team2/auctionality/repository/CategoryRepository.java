package com.team2.auctionality.repository;

import com.team2.auctionality.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category,Integer> {

    List<Category> findByParentIsNull();

    List<Category> findByParentId(Integer parentId);
    
    long countByParentId(Integer parentId);

    /**
     * Count products in category and all its subcategories
     */
    @org.springframework.data.jpa.repository.Query("""
        SELECT COUNT(p)
        FROM Product p
        WHERE p.category.id = :categoryId
           OR p.category.parent.id = :categoryId
    """)
    long countProductsInCategoryAndSubcategories(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId);
}
