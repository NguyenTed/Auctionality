package com.team2.auctionality.service;

import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.ProductTopMostBidDto;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
}
