package com.team2.auctionality.controller;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.service.CategoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Category", description = "Category & Subcategory API")
@RequiredArgsConstructor
public class CategoryController {

    @Autowired
    private final CategoryService categoryService;

    @GetMapping("/tree")
    public ResponseEntity<List<CategoryDto>> getCategoryTree() {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }

    // TODO: When implementing category write operations, add method-level security annotations:
    // Example for category creation/update/delete (admin only):
    // @PostMapping
    // @PreAuthorize("hasRole('ADMIN') and hasPermission(null, 'CATEGORY_MANAGE')")
    // public ResponseEntity<CategoryDto> createCategory(@RequestBody CreateCategoryRequest request) { ... }

}
