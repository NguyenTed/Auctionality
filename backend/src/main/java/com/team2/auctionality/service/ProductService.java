package com.team2.auctionality.service;

import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.ProductTopMostBidDto;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public List<ProductDto> getTop5EndingSoon() {
        return productRepository.findTop5EndingSoon(PageRequest.of(0, 5))
                .stream()
                .map(productMapper::toDto)
                .toList();

    }

    public List<ProductTopMostBidDto> getTop5MostBid() {
        return productRepository.findTop5MostBid(PageRequest.of(0, 5));
    }

    public List<ProductDto> getTop5HighestPrice() {
        return productRepository.findTop5HighestPrice(PageRequest.of(0, 5))
                .stream()
                .map(productMapper::toDto)
                .toList();
    }

    public Page<ProductDto> getProductsByCategory(Integer categoryId, int page, int size) {
        return productRepository.findByCategory(categoryId, PageRequest.of(page, size))
                .map(productMapper::toDto);
    }

    public Page<ProductDto> searchProducts(
            String keyword,
            Integer categoryId,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = PageRequest.of(page, size, getSort(sort));

        Page<Product> products = productRepository.searchProducts(keyword, categoryId, pageable);

        return products.map(productMapper::toDto);
    }

    private Sort getSort(String sortKey) {
        return switch (sortKey) {
            case "priceAsc" -> Sort.by("currentPrice").ascending();
            case "priceDesc" -> Sort.by("currentPrice").descending();
            case "endTimeAsc" -> Sort.by("endTime").ascending();
            case "endTimeDesc" -> Sort.by("endTime").descending();
            default -> Sort.by("endTime").descending();
        };
    }
}
