package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.*;
import com.team2.auctionality.enums.ProductTopType;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.mapper.RejectedBidderMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.service.BidService;
import com.team2.auctionality.service.ProductService;
import com.team2.auctionality.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product", description = "Product API")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final BidService bidService;
    private final ProductMapper productMapper;

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public PagedResponse<ProductDto> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return PaginationMapper.from(
                productService.getProductsByCategory(
                        categoryId, 
                        PaginationUtils.createPageable(page, size)
                )
        );
    }

    @GetMapping("/top")
    @Operation(summary = "Get top products by type")
    public ResponseEntity<?> getTopProducts(
            @RequestParam ProductTopType type
    ) {
        return switch (type) {
            case ENDING_SOON -> ResponseEntity.ok(productService.getTop5EndingSoon());
            case MOST_BID -> ResponseEntity.ok(productService.getTop5MostBid());
            case HIGHEST_PRICE -> ResponseEntity.ok(productService.getTop5HighestPrice());
        };
    }

    @GetMapping("/search")
    @Operation(summary = "Search products")
    public PagedResponse<ProductDto> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "endTimeDesc") String sort
    ) {
        return PaginationMapper.from(
                productService.searchProducts(
                        keyword, 
                        categoryId, 
                        PaginationUtils.createPageable(page, size),
                        sort
                )
        );
    }

    @GetMapping
    @Operation(summary = "Get all products")
    public PagedResponse<ProductDto> getAllProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return PaginationMapper.from(
                productService.getAllProducts(PaginationUtils.createPageable(page, size))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by id")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Integer id) {
        ProductDto product = productMapper.toDto(productService.getProductById(id));
        return ResponseEntity.ok(product);
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Get related products (5 products from same category)")
    public ResponseEntity<List<ProductDto>> getRelatedProducts(@PathVariable Integer id) {
        Product product = productService.getProductById(id);
        if (product.getCategory() == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ProductDto> relatedProducts = productService.getRelatedProducts(id, product.getCategory().getId());
        return ResponseEntity.ok(relatedProducts);
    }

    @PostMapping
    @Operation(summary = "Create product")
    public ResponseEntity<ProductDto> createProduct(
            @CurrentUser User user,
            @Valid @RequestBody CreateProductDto productDto
    ) {
        log.info("User {} creating product: {}", user.getId(), productDto.getTitle());
        ProductDto createdProduct = productService.createProduct(user, productDto);
        URI location = URI.create("/api/products/" + createdProduct.getId());
        return ResponseEntity
                .created(location)
                .body(createdProduct);
    }

    @PostMapping("/{productId}/descriptions")
    @Operation(summary = "Add extra description for product")
    public ResponseEntity<ProductExtraDescription> addExtraDescription(
            @PathVariable Integer productId,
            @Valid @RequestBody CreateExtraDescriptionDto dto,
            @CurrentUser User user
    ) {
        log.info("User {} adding description to product {}", user.getId(), productId);
        ProductExtraDescription productExtraDescription = productService.addExtraDescription(productId, dto);
        URI location = URI.create("/api/products/" + productId + "/descriptions/" + productExtraDescription.getId());
        return ResponseEntity
                .created(location)
                .body(productExtraDescription);
    }

    @GetMapping("/{productId}/descriptions")
    @Operation(summary = "Get all extra description by productId")
    public ResponseEntity<List<ProductExtraDescription>> getDescriptionByProductId(@PathVariable Integer productId) {
        List<ProductExtraDescription> productExtraDescriptions = productService.getDescriptionByProductId(productId);

        return ResponseEntity
                .ok(productExtraDescriptions);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product by id")
    public ResponseEntity<Void> deleteProductById(
            @PathVariable Integer id,
            @CurrentUser User user
    ) {
        log.info("User {} deleting product {}", user.getId(), id);
        productService.deleteProductById(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/seller/my-products")
    @Operation(summary = "Get current seller's products")
    public PagedResponse<ProductDto> getMyProducts(
            @CurrentUser User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return PaginationMapper.from(
                productService.getProductsBySeller(
                        user.getId(),
                        PaginationUtils.createPageable(page, size)
                )
        );
    }
}