package com.team2.auctionality.controller;

import com.team2.auctionality.dto.CreateProductDto;
import com.team2.auctionality.dto.PagedResponse;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.ProductTopMostBidDto;
import com.team2.auctionality.enums.ProductTopType;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static com.team2.auctionality.enums.ProductTopType.ENDING_SOON;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product", description = "Product API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
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

    @GetMapping("/top")
    public List<?> getTopProducts(
            @RequestParam ProductTopType type
    ) {
        return switch (type) {
            case ENDING_SOON -> productService.getTop5EndingSoon();
            case MOST_BID -> productService.getTop5MostBid();
            case HIGHEST_PRICE -> productService.getTop5HighestPrice();
        };
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

    @GetMapping
    public PagedResponse<ProductDto> getAllProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (page < 1) {
            page = PAGE_DEFAULT_VALUE;
        }
        if (size < 1) {
            size = PAGE_SIZE_DEFAULT_VALUE;
        }
        return PaginationMapper.from(productService.getAllProducts(page - 1, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Integer id) {
        return ResponseEntity.ok(ProductMapper.toDto(productService.getProductById(id)));
    }

    @PostMapping
    public ProductDto createProduct(@RequestBody CreateProductDto productDto) {
         return productService.createProduct(productDto);
    }

    @PutMapping("/{id}")
    public ProductDto editProductById(@PathVariable Integer id, @RequestBody CreateProductDto productDto) {
        return productService.editProductById(id, productDto);
    }

    @DeleteMapping("/{id}")
    public void deleteProductById(@PathVariable Integer id) {
        productService.deleteProductById(id);
    }

}
