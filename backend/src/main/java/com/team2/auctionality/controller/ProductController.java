package com.team2.auctionality.controller;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.enums.ProductTopType;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.mapper.ProductQuestionMapper;
import com.team2.auctionality.mapper.RejectedBidderMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.service.AuthService;
import com.team2.auctionality.service.BidService;
import com.team2.auctionality.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product", description = "Product API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private static final int PAGE_DEFAULT_VALUE = 1;
    private static final int PAGE_SIZE_DEFAULT_VALUE = 10;

    private final ProductService productService;
    private final BidService bidService;
    private final AuthService authService;


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
    public ProductDto getProductById(@PathVariable Integer id) {
        return ProductMapper.toDto(productService.getProductById(id));
    }

    @PostMapping
    @Operation(summary = "Create product")
    @PreAuthorize("hasRole('SELLER') or hasAuthority('PRODUCT_CREATE')")
    public ProductDto createProduct(
            Authentication authentication,
            @Valid @RequestBody CreateProductDto productDto) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
         return productService.createProduct(user, productDto);
    }

    @PostMapping("/{productId}/descriptions")
    @Operation(summary = "Add extra description for product")
    @PreAuthorize("hasRole('SELLER') or hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<ProductExtraDescription> addExtraDescription(@PathVariable Integer productId, @Valid @RequestBody CreateExtraDescriptionDto dto) {
        ProductExtraDescription productExtraDescription = productService.addExtraDescription(productId, dto);
        URI location = URI.create("/api/" + productId + "/descriptions");

        return ResponseEntity
                .created(location)
                .body(
                        productExtraDescription
                );
    }

    @GetMapping("/{productId}/descriptions")
    @Operation(summary = "Get all extra description by productId")
    public ResponseEntity<List<ProductExtraDescription>> getDescriptionByProductId(@PathVariable Integer productId) {
        List<ProductExtraDescription> productExtraDescriptions = productService.getDescriptionByProductId(productId);

        return ResponseEntity
                .ok(productExtraDescriptions);
    }

//    @PutMapping("/{id}")
//    public ProductDto editProductById(@PathVariable Integer id, @RequestBody CreateProductDto productDto) {
//        return productService.editProductById(id, productDto);
//    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasAuthority('PRODUCT_DELETE_OWN')")
    public void deleteProductById(@PathVariable Integer id) {
        productService.deleteProductById(id);
    }

    @PostMapping("/{productId}/bidders/{bidderId}/reject")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<RejectedBidderDto> rejectBidder(
            @PathVariable Integer productId,
            @PathVariable Integer bidderId,
            @RequestBody(required = false) RejectBidderRequest request
    ) {
        RejectedBidder rejectedBidder = productService.rejectBidder(
                productId,
                bidderId,
                request != null ? request.getReason() : null
        );

        return ResponseEntity.ok(RejectedBidderMapper.toDto(rejectedBidder));
    }


    // Bids api
    @GetMapping("/{productId}/bids")
    @Operation(summary = "Get bids histories by productId")
    public ResponseEntity<List<BidHistoryDto>> getBidHistoryByProductId(
            @PathVariable Integer productId
    ) {
        return ResponseEntity.ok(
                bidService.getBidHistory(productId)
        );
    }

    @PostMapping("/{productId}/bids")
    @Operation(summary = "Place bid")
    @PreAuthorize("hasRole('BUYER') or hasAuthority('BID_PLACE')")
    public ResponseEntity<ApiResponse<Bid>> placeBid(
            @PathVariable Integer productId,
            @RequestBody PlaceBidRequest bidRequest,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        Bid bid = bidService.placeBid(user, productId, bidRequest);

        URI location = URI.create("/api/bids/" + bid.getId());

        return ResponseEntity
                .created(location)
                .body(new ApiResponse<>(
                        "Bid placed successfully",
                        bid
                ));
    }

    @PostMapping("/{productId}/questions")
    @Operation(summary = "Add question")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<ProductQuestionDto>> addQuestion(
            @PathVariable Integer productId,
            @RequestBody AddQuestionDto questionDto,
            Authentication authentication) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        ProductQuestion question = productService.addQuestion(user, productId, questionDto);
        URI location = URI.create("/api/bids/" + question.getId());

        return ResponseEntity
                .created(location)
                .body(new ApiResponse<>(
                        "Add question successfully",
                        ProductQuestionMapper.toDto(question)
                ));
    }
    @GetMapping("/{productId}/questions")
    @Operation(summary = "Get all questions by id")
    public ResponseEntity<List<ProductQuestionDto>> getQuestionById(@PathVariable Integer productId) {
        return ResponseEntity.ok(productService.getQuestionById(productId));
    }

}
