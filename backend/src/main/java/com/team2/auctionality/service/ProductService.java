package com.team2.auctionality.service;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.exception.InvalidBidPriceException;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductExtraDescriptionRepository productExtraDescriptionRepository;
    private final BidRepository bidRepository;
    private final CategoryService categoryService;

    @Transactional(readOnly = true)
    public List<ProductDto> getTop5EndingSoon() {
        return productRepository.findTop5EndingSoon(PageRequest.of(0, 5))
                .stream()
                .map(ProductMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductTopMostBidDto> getTop5MostBid() {
        return productRepository.findTop5MostBid(PageRequest.of(0, 5))
                .stream()
                .map(product -> {
                    // Count bids for this product
                    long bidCount = product.getBids() != null ? product.getBids().size() : 0;
                    return new ProductTopMostBidDto(
                            product.getId(),
                            product.getTitle(),
                            product.getStatus(),
                            product.getStartPrice(),
                            product.getCurrentPrice(),
                            product.getBuyNowPrice(),
                            product.getBidIncrement(),
                            product.getStartTime(),
                            product.getEndTime(),
                            product.getAutoExtensionEnabled(),
                            product.getSeller() != null ? product.getSeller().getId() : null,
                            product.getCategory(),
                            product.getImages(),
                            bidCount
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getTop5HighestPrice() {
        return productRepository.findTop5HighestPrice(PageRequest.of(0, 5))
                .stream()
                .map(ProductMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByCategory(Integer categoryId, int page, int size) {
        return productRepository.findByCategory(categoryId, PageRequest.of(page, size))
                .map(ProductMapper::toDto);
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public Page<ProductDto> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository
                .findAll(pageable)
                .map(ProductMapper::toDto);
    }

    public ProductDto createProduct(User seller, CreateProductDto productDto) {
        Product product = Product.builder()
                .title(productDto.getTitle())
                .status(ProductStatus.active)
                .startPrice(productDto.getStartPrice())
                .currentPrice(0f)
                .buyNowPrice(productDto.getBuyNowPrice())
                .bidIncrement(productDto.getBidIncrement())
                .startTime(productDto.getStartTime())
                .endTime(productDto.getEndTime())
                .autoExtensionEnabled(productDto.getAutoExtensionEnabled())
                .seller(seller)
                .category(categoryService.getCategoryById(productDto.getCategoryId()))
                .build();

        Product addedProduct = productRepository.save(product);
        return ProductMapper.toDto(addedProduct);

    }

    public void deleteProductById(Integer id) {
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Integer id) {
        return productRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found"));
    }

    public static void checkIsAmountAvailable(Float amount, Float step, Float currentPrice) {
        if (amount <= currentPrice) throw new InvalidBidPriceException("Bid amount more than " + currentPrice + ".");
        if ((amount - currentPrice) % step != 0) {
            throw new InvalidBidPriceException(
                    "Bid price must increase by step of " + step
            );
        }
    }

    @Transactional
    public void save(Product product) {
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<Product> getAuctionProductsByUser(Integer userId) {
        return productRepository.findProductsUserHasBidOn(userId);
    }

    @Transactional(readOnly = true)
    public List<Product> getWonProducts(User user) {
        return productRepository.findWonProductsByUserId(user.getId());
    }

    @Transactional
    public ProductExtraDescription addExtraDescription(Integer productId, CreateExtraDescriptionDto dto) {
        Product product = getProductById(productId);
        ProductExtraDescription description = ProductExtraDescription.builder()
                .productId(productId)
                .content(dto.getContent())
                .createdAt(new Date())
                .build();
        return productExtraDescriptionRepository.save(description);
    }

    @Transactional(readOnly = true)
    public List<ProductExtraDescription> getDescriptionByProductId(Integer productId) {
        return productExtraDescriptionRepository.getProductExtraDescriptionByProductId(productId);
    }
}
