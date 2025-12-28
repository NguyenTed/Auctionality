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
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final BidService bidService;

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public PagedResponse<ProductDto> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        page = Math.max(1, page);
        size = Math.max(1, Math.min(100, size)); // Max page size 100
        return PaginationMapper.from(productService.getProductsByCategory(categoryId, page - 1, size));
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
        page = Math.max(1, page);
        size = Math.max(1, Math.min(100, size)); // Max page size 100
        return PaginationMapper.from(productService.searchProducts(keyword, categoryId, page - 1, size, sort));
    }

    @GetMapping
    @Operation(summary = "Get all products")
    public PagedResponse<ProductDto> getAllProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        page = Math.max(1, page);
        size = Math.max(1, Math.min(100, size)); // Max page size 100
        return PaginationMapper.from(productService.getAllProducts(page - 1, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by id")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Integer id) {
        ProductDto product = ProductMapper.toDto(productService.getProductById(id));
        return ResponseEntity.ok(product);
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
        productService.deleteProductById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productId}/bidders/{bidderId}")
    @Operation(summary = "Reject a bidder from product")
    public ResponseEntity<RejectedBidderDto> rejectBidder(
            @PathVariable Integer productId,
            @PathVariable Integer bidderId,
            @RequestBody(required = false) RejectBidderRequest request,
            @CurrentUser User user
    ) {
        log.info("User {} rejecting bidder {} from product {}", user.getId(), bidderId, productId);
        RejectedBidder rejectedBidder = bidService.rejectBidder(
                productId,
                bidderId,
                request != null ? request.getReason() : null
        );

        return ResponseEntity.ok(RejectedBidderMapper.toDto(rejectedBidder));
    }
}