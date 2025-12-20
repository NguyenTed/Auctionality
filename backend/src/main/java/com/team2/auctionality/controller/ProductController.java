package com.team2.auctionality.controller;

import com.team2.auctionality.dto.PagedResponse;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.ProductTopMostBidDto;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product", description = "Product API")
@RequiredArgsConstructor
public class ProductController {

    private static final int PAGE_DEFAULT_VALUE = 1;
    private static final int PAGE_SIZE_DEFAULT_VALUE = 10;

    private final ProductService productService;

    @GetMapping("/category/{categoryId}")
    public PagedResponse<ProductDto> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (page < 1) {
            page = PAGE_DEFAULT_VALUE;
        }
        if (size < 1) {
            size = PAGE_SIZE_DEFAULT_VALUE;
        }
        return PaginationMapper.from(productService.getProductsByCategory(categoryId, page - 1, size));
    }

    @GetMapping("/top-ending-soon")
    public List<ProductDto> getTopEndingSoon() {
        return productService.getTop5EndingSoon();
    }

    @GetMapping("/top-most-bid")
    public List<ProductTopMostBidDto> getTopMostBid() {
        return productService.getTop5MostBid();
    }

    @GetMapping("/top-highest-price")
    public List<ProductDto> getTopHighestPrice() {
        return productService.getTop5HighestPrice();
    }

    @GetMapping("/search")
    public PagedResponse<ProductDto> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "endTimeDesc") String sort // endTimeDesc | priceAsc
    ) {
        if (page < 1) {
            page = PAGE_DEFAULT_VALUE;
        }
        if (size < 1) {
            size = PAGE_SIZE_DEFAULT_VALUE;
        }
        return PaginationMapper.from(productService.searchProducts(keyword, categoryId, page - 1, size, sort));
    }

    // TODO: When implementing write operations, add method-level security annotations:
    // Example for product creation:
    // @PostMapping
    // @PreAuthorize("hasRole('SELLER') or hasPermission(null, 'PRODUCT_CREATE')")
    // public ResponseEntity<ProductDto> createProduct(@RequestBody CreateProductRequest request) { ... }
    //
    // Example for product update:
    // @PutMapping("/{id}")
    // @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    // public ResponseEntity<ProductDto> updateProduct(@PathVariable Integer id, @RequestBody UpdateProductRequest request) { ... }
    //
    // Example for product deletion:
    // @DeleteMapping("/{id}")
    // @PreAuthorize("hasPermission(null, 'PRODUCT_DELETE') or (hasPermission(null, 'PRODUCT_DELETE_OWN') and @productService.isOwner(#id))")
    // public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) { ... }

}
