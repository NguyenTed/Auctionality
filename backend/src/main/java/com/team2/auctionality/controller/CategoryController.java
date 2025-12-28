package com.team2.auctionality.controller;

import com.team2.auctionality.dto.CategoryDto;
import com.team2.auctionality.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Category", description = "Category & Subcategory API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    @Operation(summary = "Get category tree with subcategories")
    public ResponseEntity<List<CategoryDto>> getCategoryTree() {
        log.debug("Getting category tree");
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }

}
