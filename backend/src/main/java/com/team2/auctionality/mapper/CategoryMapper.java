package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.model.Category;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {
    public CategoryDto toDto(Category category) {
        List<CategoryDto> childDtos = category.getChildren()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                childDtos
        );
    }
}
