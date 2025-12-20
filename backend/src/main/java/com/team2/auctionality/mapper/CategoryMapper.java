package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.model.Category;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {
    public static CategoryDto toDto(Category category) {
        List<CategoryDto> childDtos = category.getChildren()
                .stream()
                .map(CategoryMapper::toDto)
                .collect(Collectors.toList());

        return  CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .children(childDtos)
                .build();

    }
}
