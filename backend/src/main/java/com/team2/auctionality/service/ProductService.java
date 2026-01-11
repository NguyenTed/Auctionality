package com.team2.auctionality.service;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.email.EmailService;
import com.team2.auctionality.email.dto.DescriptionUpdateEmailRequest;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.exception.AuctionClosedException;
import com.team2.auctionality.exception.InvalidBidPriceException;
import com.team2.auctionality.mapper.BidMapper;
import com.team2.auctionality.mapper.HighestBidderInfoMapper;
import com.team2.auctionality.mapper.OrderMapper;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final com.team2.auctionality.repository.ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Transactional(readOnly = true)
    public List<ProductDto> getTop5EndingSoon() {
        return productRepository.findTop5EndingSoon(PageRequest.of(0, 5))
                .stream()
                .map(product -> {
                    Integer id = product.getId();

                    // Get the highest bid
                    Bid highestBid = bidRepository
                            .findHighestBid(id)
                            .orElse(null);

                    return ProductMapper.toDto(
                            product,
                            highestBid
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductTopMostBidDto> getTop5MostBid() {
        return productRepository.findTop5MostBid(PageRequest.of(0, 5))
                .stream()
                .map(product -> {
                    // Get the highest bid
                    Bid highestBid = bidRepository
                            .findHighestBid(product.getId())
                            .orElse(null);
                    // Count bids for this product
                    long bidCount = product.getBids() != null ? product.getBids().size() : 0;
                    return new ProductTopMostBidDto(
                            product.getId(),
                            product.getTitle(),
                            product.getDescription(),
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
                            bidCount,
                            HighestBidderInfoMapper.toDto(highestBid)
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getTop5HighestPrice() {
        return productRepository.findTop5HighestPrice(PageRequest.of(0, 5))
                .stream()
                .map(product -> {
                    Integer id = product.getId();

                    // Get the highest bid
                    Bid highestBid = bidRepository
                            .findHighestBid(id)
                            .orElse(null);

                    return ProductMapper.toDto(
                            product,
                            highestBid
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByCategory(Integer categoryId, Pageable pageable) {

        Page<Product> productPage = productRepository.findByCategory(categoryId, pageable);

        return productPage.map(product -> {
            Integer id = product.getId();

            // Get the highest bid
            Bid highestBid = bidRepository
                    .findHighestBid(id)
                    .orElse(null);

            return ProductMapper.toDto(
                    product,
                    highestBid
            );
        });
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

        return products.map(product -> {
            Integer id = product.getId();

            // Get the highest bid
            Bid highestBid = bidRepository
                    .findHighestBid(id)
                    .orElse(null);

            return ProductMapper.toDto(
                    product,
                    highestBid
            );
        });
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
                .map(product -> {
                    Integer id = product.getId();

                    // Get highest bid
                    Bid highestBid = bidRepository
                            .findHighestBid(id)
                            .orElse(null);

                    return ProductMapper.toDto(
                            product,
                            highestBid
                    );
                });
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
            // If there are bids, only allow updating images and additional information (description versioning)
            // Description is locked - cannot be updated directly
            // Update images - explicitly delete old images, then set new ones
            if (productDto.getImages() != null && !productDto.getImages().isEmpty()) {
                // Explicitly delete all existing images using JPQL
                productImageRepository.deleteByProductId(productId);
                // Create and set new images (safe now since we're using explicit deletion, not orphanRemoval)
                List<ProductImage> newImages = new ArrayList<>();
                for (CreateProductImageDto imageDto : productDto.getImages()) {
                    ProductImage image = new ProductImage();
                    image.setUrl(imageDto.getUrl());
                    image.setIsThumbnail(imageDto.getIsThumbnail() != null ? imageDto.getIsThumbnail() : false);
                    image.setProduct(product);
                    newImages.add(image);
                }
                product.setImages(newImages);
            }
        } else {
            // No bids yet, allow full update (except description - description is locked and versioned)
            product.setTitle(productDto.getTitle());
            product.setCategory(categoryService.getCategoryById(productDto.getCategoryId()));
            product.setStartPrice(productDto.getStartPrice());
            product.setBidIncrement(productDto.getBidIncrement());
            product.setBuyNowPrice(productDto.getBuyNowPrice());
            product.setStartTime(productDto.getStartTime());
            product.setEndTime(productDto.getEndTime());
            product.setAutoExtensionEnabled(productDto.getAutoExtensionEnabled() != null ? productDto.getAutoExtensionEnabled() : true);
            // Description is NOT updated - it's locked and can only be versioned via additionalInformation
            
            // Update images - explicitly delete old images, then set new ones
            if (productDto.getImages() != null && !productDto.getImages().isEmpty()) {
                // Explicitly delete all existing images using JPQL
                productImageRepository.deleteByProductId(productId);
                // Create and set new images (safe now since we're using explicit deletion, not orphanRemoval)
                List<ProductImage> newImages = new ArrayList<>();
                for (CreateProductImageDto imageDto : productDto.getImages()) {
                    ProductImage image = new ProductImage();
                    image.setUrl(imageDto.getUrl());
                    image.setIsThumbnail(imageDto.getIsThumbnail() != null ? imageDto.getIsThumbnail() : false);
                    image.setProduct(product);
                    newImages.add(image);
                }
                product.setImages(newImages);
            }
        }
        
        // Handle additional information - creates a new description version if provided
        // This is allowed for both products with bids and without bids
        if (productDto.getAdditionalInformation() != null && !productDto.getAdditionalInformation().trim().isEmpty()) {
            String plainText = productDto.getAdditionalInformation().replaceAll("<[^>]*>", "").trim();
            if (plainText.length() >= 10 && plainText.length() <= 10000) {
                ProductExtraDescription extraDescription = ProductExtraDescription.builder()
                        .productId(productId)
                        .content(productDto.getAdditionalInformation())
                        .createdAt(LocalDateTime.now())
                        .build();
                productExtraDescriptionRepository.save(extraDescription);

                // Send email notifications to all bidders (excluding rejected ones)
                try {
                    List<Integer> bidderIds = bidRepository.findDistinctBidderIdsByProductId(productId);
                    String productTitle = product.getTitle();
                    String productUrl = frontendBaseUrl + "/products/" + productId;

                    log.info("Sending description update notifications to {} bidders for product {} (via updateProduct)", bidderIds.size(), productId);

                    for (Integer bidderId : bidderIds) {
                        try {
                            User bidder = userRepository.findById(bidderId).orElse(null);
                            if (bidder != null && bidder.getEmail() != null) {
                                String bidderName = bidder.getProfile() != null && bidder.getProfile().getFullName() != null
                                        ? bidder.getProfile().getFullName()
                                        : bidder.getEmail();

                                emailService.sendDescriptionUpdateNotification(
                                        new DescriptionUpdateEmailRequest(
                                                bidder.getEmail(),
                                                productTitle,
                                                productUrl,
                                                bidderName
                                        )
                                );
                            }
                        } catch (Exception e) {
                            log.error("Failed to send description update notification to bidder {} for product {}: {}",
                                    bidderId, productId, e.getMessage(), e);
                            // Continue with other bidders even if one fails
                        }
                    }

                    log.info("Successfully sent description update notifications for product {} (via updateProduct)", productId);
                } catch (Exception e) {
                    log.error("Error sending description update notifications for product {}: {}", productId, e.getMessage(), e);
                    // Don't throw - email failures shouldn't break the product update
                }
            }
        }
        
        Product updatedProduct = productRepository.save(product);

        // Get highest bid
        Bid highestBid = bidRepository
                .findHighestBid(productId)
                .orElse(null);

        // Get extra descriptions (description versions)
        List<ProductExtraDescription> extraDescriptions = productExtraDescriptionRepository
                .getProductExtraDescriptionByProductId(productId);

        return productMapper.toDto(updatedProduct, highestBid, extraDescriptions);
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
                .createdAt(LocalDateTime.now())
                .build();
        ProductExtraDescription savedDescription = productExtraDescriptionRepository.save(description);

        // Send email notifications to all bidders (excluding rejected ones)
        try {
            List<Integer> bidderIds = bidRepository.findDistinctBidderIdsByProductId(productId);
            String productTitle = product.getTitle();
            String productUrl = frontendBaseUrl + "/products/" + productId;

            log.info("Sending description update notifications to {} bidders for product {}", bidderIds.size(), productId);

            for (Integer bidderId : bidderIds) {
                try {
                    User bidder = userRepository.findById(bidderId).orElse(null);
                    if (bidder != null && bidder.getEmail() != null) {
                        String bidderName = bidder.getProfile() != null && bidder.getProfile().getFullName() != null
                                ? bidder.getProfile().getFullName()
                                : bidder.getEmail();

                        emailService.sendDescriptionUpdateNotification(
                                new DescriptionUpdateEmailRequest(
                                        bidder.getEmail(),
                                        productTitle,
                                        productUrl,
                                        bidderName
                                )
                        );
                    }
                } catch (Exception e) {
                    log.error("Failed to send description update notification to bidder {} for product {}: {}",
                            bidderId, productId, e.getMessage(), e);
                    // Continue with other bidders even if one fails
                }
            }

            log.info("Successfully sent description update notifications for product {}", productId);
        } catch (Exception e) {
            log.error("Error sending description update notifications for product {}: {}", productId, e.getMessage(), e);
            // Don't throw - email failures shouldn't break the description update
        }

        return savedDescription;
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
                .map(product -> {
                    Integer id = product.getId();

                    // Get the highest bid
                    Bid highestBid = bidRepository
                            .findHighestBid(id)
                            .orElse(null);

                    return ProductMapper.toDto(
                            product,
                            highestBid
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsBySeller(Integer sellerId, String keyword, Pageable pageable) {
        Page<Product> productPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            productPage = productRepository.findBySellerIdAndTitleContaining(sellerId, keyword.trim(), pageable);
        } else {
            productPage = productRepository.findBySellerId(sellerId, pageable);
        }
        
        return productPage.map(product -> {
            Integer id = product.getId();

            // Get the highest bid
            Bid highestBid = bidRepository
                    .findHighestBid(id)
                    .orElse(null);

            return ProductMapper.toDto(
                    product,
                    highestBid
            );
        });
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
