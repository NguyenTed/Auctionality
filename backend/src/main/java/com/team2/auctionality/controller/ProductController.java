package com.team2.auctionality.controller;

import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.ProductTopMostBidDto;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product", description = "Product API")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/category/{categoryId}")
    public Page<ProductDto> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return productService.getProductsByCategory(categoryId, page - 1, size);
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

}
