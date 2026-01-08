package com.team2.auctionality.service;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.exception.AuctionClosedException;
import com.team2.auctionality.exception.InvalidBidPriceException;
import com.team2.auctionality.mapper.OrderMapper;
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

import java.time.LocalDateTime;
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
    private final OrderService orderService;

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
    public ProductDto updateProduct(Integer productId, User seller, UpdateProductDto productDto) {
        Product product = getProductById(productId);
        
        // Ownership validation
        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new com.team2.auctionality.exception.BidNotAllowedException(
                    "You can only update your own products"
            );
        }
        
        // Check if product has bids - if so, only allow certain fields to be updated
        long bidCount = bidRepository.countByProductId(productId);
        if (bidCount > 0) {
            // If there are bids, only allow updating description and images
            product.setDescription(productDto.getDescription());
            // Update images
            if (productDto.getImages() != null && !productDto.getImages().isEmpty()) {
                // Remove existing images
                product.getImages().clear();
                // Add new images
                for (CreateProductImageDto imageDto : productDto.getImages()) {
                    ProductImage image = new ProductImage();
                    image.setUrl(imageDto.getUrl());
                    image.setIsThumbnail(imageDto.getIsThumbnail() != null ? imageDto.getIsThumbnail() : false);
                    image.setProduct(product);
                    product.getImages().add(image);
                }
            }
        } else {
            // No bids yet, allow full update
            product.setTitle(productDto.getTitle());
            product.setCategory(categoryService.getCategoryById(productDto.getCategoryId()));
            product.setStartPrice(productDto.getStartPrice());
            product.setBidIncrement(productDto.getBidIncrement());
            product.setBuyNowPrice(productDto.getBuyNowPrice());
            product.setStartTime(productDto.getStartTime());
            product.setEndTime(productDto.getEndTime());
            product.setAutoExtensionEnabled(productDto.getAutoExtensionEnabled() != null ? productDto.getAutoExtensionEnabled() : true);
            product.setDescription(productDto.getDescription());
            
            // Update images
            if (productDto.getImages() != null && !productDto.getImages().isEmpty()) {
                product.getImages().clear();
                for (CreateProductImageDto imageDto : productDto.getImages()) {
                    ProductImage image = new ProductImage();
                    image.setUrl(imageDto.getUrl());
                    image.setIsThumbnail(imageDto.getIsThumbnail() != null ? imageDto.getIsThumbnail() : false);
                    image.setProduct(product);
                    product.getImages().add(image);
                }
            }
        }
        
        Product updatedProduct = productRepository.save(product);
        return productMapper.toDto(updatedProduct);
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

    @Transactional
    public OrderDto buyNow(Integer productId, User buyer) {
        Product product = getProductById(productId);
        LocalDateTime now = LocalDateTime.now();

        // Validate buy now price exists
        if (product.getBuyNowPrice() == null) {
            throw new IllegalArgumentException("This product does not have a buy now price");
        }

        // Validate auction is still active
        if (product.getEndTime().isBefore(now) || product.getEndTime().isEqual(now)) {
            throw new AuctionClosedException("Auction has already ended");
        }

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("Product is not active");
        }

        // Validate buyer is not the seller
        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("You cannot buy your own product");
        }

        // End the auction immediately
        product.setStatus(ProductStatus.ENDED);
        product.setEndTime(now);
        productRepository.save(product);

        // Create order
        Order order = orderService.createOrderForBuyNow(
                product,
                buyer.getId(),
                product.getBuyNowPrice()
        );

        log.info("Buy now completed for product {} by user {}, order {} created", 
                productId, buyer.getId(), order.getId());

        return OrderMapper.toDto(order);
    }
}
