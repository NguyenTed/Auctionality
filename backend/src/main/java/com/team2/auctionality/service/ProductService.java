package com.team2.auctionality.service;

import com.team2.auctionality.dto.CreateProductDto;
import com.team2.auctionality.dto.ProductDto;
import com.team2.auctionality.dto.ProductTopMostBidDto;
import com.team2.auctionality.exception.InvalidBidPriceException;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> getTop5EndingSoon() {
        return productRepository.findTop5EndingSoon(PageRequest.of(0, 5))
                .stream()
                .map(ProductMapper::toDto)
                .toList();

    }

    public List<ProductTopMostBidDto> getTop5MostBid() {
        return productRepository.findTop5MostBid(PageRequest.of(0, 5));
    }

    public List<ProductDto> getTop5HighestPrice() {
        return productRepository.findTop5HighestPrice(PageRequest.of(0, 5))
                .stream()
                .map(ProductMapper::toDto)
                .toList();
    }

    public Page<ProductDto> getProductsByCategory(Integer categoryId, int page, int size) {
        return productRepository.findByCategory(categoryId, PageRequest.of(page, size))
                .map(ProductMapper::toDto);
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

        return products.map(ProductMapper::toDto);
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

    public Page<ProductDto> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository
                .findAll(pageable)
                .map(ProductMapper::toDto);
    }

    public ProductDto createProduct(CreateProductDto productDto) {
        Product product = Product.builder()
                .title(productDto.getTitle())
                .status(productDto.getStatus())
                .startPrice(productDto.getStartPrice())
                .currentPrice(productDto.getCurrentPrice())
                .buyNowPrice(productDto.getBuyNowPrice())
                .bidIncrement(productDto.getBidIncrement())
                .startTime(productDto.getStartTime())
                .endTime(productDto.getEndTime())
                .autoExtensionEnabled(productDto.getAutoExtensionEnabled())
                .seller(productRepository.getReferenceById(productDto.getSellerId()).getSeller())
                .category(productRepository.getReferenceById(productDto.getCategoryId()).getCategory())
                .build();

        Product addedProduct = productRepository.save(product);
        return ProductMapper.toDto(addedProduct);

    }

    public void deleteProductById(Integer id) {
        productRepository.deleteById(id);
    }

    public Product getProductById(Integer id) {
        return productRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found"));
    }

    public ProductDto editProductById(Integer id, CreateProductDto productDto) {
        Product product = getProductById(id);

        product.setTitle(productDto.getTitle());
        product.setStatus(productDto.getStatus());
        product.setStartPrice(productDto.getStartPrice());
        product.setCurrentPrice(productDto.getCurrentPrice());
        product.setBuyNowPrice(productDto.getBuyNowPrice());
        product.setBidIncrement(productDto.getBidIncrement());
        product.setStartTime(productDto.getStartTime());
        product.setEndTime(productDto.getEndTime());
        product.setAutoExtensionEnabled(productDto.getAutoExtensionEnabled());
        product.setSeller(productRepository.getReferenceById(productDto.getSellerId()).getSeller());
        product.setCategory(productRepository.getReferenceById(productDto.getCategoryId()).getCategory());
        Product editedProduct = productRepository.save(product);
        return ProductMapper.toDto(editedProduct);

    }

    public static void checkIsAmountAvailable(Float amount, Float step, Float currentPrice) {
        if (amount <= currentPrice) throw new InvalidBidPriceException("Bid ammount more than " + currentPrice + ".");
        if ((amount - currentPrice) % step != 0) {
            throw new InvalidBidPriceException(
                    "Bid price must increase by step of " + step
            );
        }
    }
}
