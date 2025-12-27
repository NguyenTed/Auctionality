package com.team2.auctionality.service;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.mapper.CategoryMapper;
import com.team2.auctionality.model.Category;
import com.team2.auctionality.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    public List<CategoryDto> getCategoryTree() {
        return repository.findByParentIsNull()
                .stream()
                .map(CategoryMapper::toDto)
                .collect(Collectors.toList());
    }

    public Category getCategoryById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Category not found"));
    }

}
