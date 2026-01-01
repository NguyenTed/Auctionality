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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductExtraDescriptionRepository productExtraDescriptionRepository;
    private final BidRepository bidRepository;
    private final OrderRepository orderRepository;
    private final CategoryService categoryService;
    private final ProductMapper productMapper;

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
    public Page<ProductDto> getProductsByCategory(Integer categoryId, Pageable pageable) {
        return productRepository.findByCategory(categoryId, pageable)
                .map(ProductMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> searchProducts(
            String keyword,
            Integer categoryId,
            Pageable pageable,
            String sort
    ) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                getSort(sort)
        );

        Page<Product> products = productRepository.searchProducts(keyword, categoryId, sortedPageable);

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
    public Page<ProductDto> getAllProducts(Pageable pageable) {
        return productRepository
                .findAll(pageable)
                .map(ProductMapper::toDto);
    }

    @Transactional
    public ProductDto createProduct(User seller, CreateProductDto productDto) {
        Product product = Product.builder()
                .title(productDto.getTitle())
                .status(ProductStatus.ACTIVE)
                .startPrice(productDto.getStartPrice())
                .currentPrice(0f)
                .buyNowPrice(productDto.getBuyNowPrice())
                .bidIncrement(productDto.getBidIncrement())
                .startTime(productDto.getStartTime())
                .endTime(productDto.getEndTime())
                .autoExtensionEnabled(productDto.getAutoExtensionEnabled() != null ? productDto.getAutoExtensionEnabled() : true)
                .description(productDto.getDescription())
                .seller(seller)
                .category(categoryService.getCategoryById(productDto.getCategoryId()))
                .build();

        Product addedProduct = productRepository.save(product);

        // Create product images
        if (productDto.getImages() != null && !productDto.getImages().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (CreateProductImageDto imageDto : productDto.getImages()) {
                ProductImage image = new ProductImage();
                image.setUrl(imageDto.getUrl());
                image.setIsThumbnail(imageDto.getIsThumbnail() != null ? imageDto.getIsThumbnail() : false);
                image.setProduct(addedProduct);
                images.add(image);
            }
            addedProduct.setImages(images);
            addedProduct = productRepository.save(addedProduct);
        }

        return productMapper.toDto(addedProduct);
    }

    @Transactional
    public void deleteProductById(Integer id, Integer userId) {
        Product product = getProductById(id);
        
        // Ownership validation
        if (product.getSeller() == null || !product.getSeller().getId().equals(userId)) {
            throw new com.team2.auctionality.exception.BidNotAllowedException(
                    "You can only delete your own products"
            );
        }
        
        // Check for dependencies that prevent deletion
        long bidCount = bidRepository.countByProductId(id);
        long orderCount = orderRepository.countByProductId(id);
        
        if (bidCount > 0 || orderCount > 0) {
            throw new IllegalArgumentException(
                String.format("Cannot delete product with existing bids (%d) or orders (%d). " +
                            "Consider taking down the product instead.", 
                            bidCount, orderCount)
            );
        }
        
        productRepository.deleteById(id);
        log.info("Successfully deleted product {} by user {}", id, userId);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Integer id) {
        return productRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found"));
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

    /**
     * Get related products (5 products from the same category, excluding the current product)
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getRelatedProducts(Integer productId, Integer categoryId) {
        return productRepository.findRelatedProducts(categoryId, productId, PageRequest.of(0, 5))
                .stream()
                .map(ProductMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsBySeller(Integer sellerId, Pageable pageable) {
        return productRepository.findBySellerId(sellerId, pageable)
                .map(ProductMapper::toDto);
    }

    public static void checkIsAmountAvailable(Float amount, Float step, Float currentPrice) {
        if (amount <= currentPrice) throw new InvalidBidPriceException("Bid amount more than " + currentPrice + ".");
        if ((amount - currentPrice) % step != 0) {
            throw new InvalidBidPriceException(
                    "Bid price must increase by step of " + step
            );
        }
    }
}
