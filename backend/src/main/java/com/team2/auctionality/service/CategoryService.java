package com.team2.auctionality.service;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.mapper.CategoryMapper;
import com.team2.auctionality.model.Category;
import com.team2.auctionality.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository repository;

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'tree'", unless = "#result.isEmpty()")
    public List<CategoryDto> getCategoryTree() {
        log.debug("Getting category tree");
        return repository.findByParentIsNull()
                .stream()
                .map(CategoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Integer id) {
        log.debug("Getting category by id: {}", id);
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
    }
}
