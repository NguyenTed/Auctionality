package com.team2.auctionality.repository;

import com.team2.auctionality.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category,Integer> {

    List<Category> findByParentIsNull();

    List<Category> findByParentId(Long parentId);
}
