package com.team2.auctionality.service;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.exception.AuthException;
import com.team2.auctionality.exception.SellerUpgradeBadRequestException;
import com.team2.auctionality.mapper.CategoryMapper;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.mapper.SellerUpgradeRequestMapper;
import com.team2.auctionality.mapper.UserMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin service for managing categories, products, users, and seller upgrade requests
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SellerUpgradeRequestRepository sellerUpgradeRequestRepository;
    private final OrderRepository orderRepository;
    private final BidRepository bidRepository;
    private final ProductMapper productMapper;
    private final RoleRepository roleRepository;
    private final ProductModerationService productModerationService;

    // ========== Category Management ==========

    @Transactional
    public CategoryDto createCategory(CreateCategoryDto dto) {
        log.info("Admin creating category: {}", dto.getName());
        Category category = new Category();
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        if (dto.getParentId() != null) {
            category.setParent(categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent category not found")));
        }
        category = categoryRepository.save(category);
        return CategoryMapper.toDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Integer id, UpdateCategoryDto dto) {
        log.info("Admin updating category: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        
        if (dto.getName() != null) {
            category.setName(dto.getName());
        }
        if (dto.getSlug() != null) {
            category.setSlug(dto.getSlug());
        }
        if (dto.getParentId() != null) {
            category.setParent(categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent category not found")));
        } else if (dto.getParentId() == null && dto.isClearParent()) {
            category.setParent(null);
        }
        
        category = categoryRepository.save(category);
        return CategoryMapper.toDto(category);
    }

    @Transactional
    public void deleteCategory(Integer id) {
        log.info("Admin deleting category: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        
        // Check if category has products (including subcategories)
        long productCount = categoryRepository.countProductsInCategoryAndSubcategories(id);
        if (productCount > 0) {
            throw new IllegalArgumentException(
                String.format("Cannot delete category with existing products (%d). " +
                            "Remove all products from this category and its subcategories first.", 
                            productCount)
            );
        }
        
        // Check if category has children
        List<Category> children = categoryRepository.findByParentId(id);
        if (!children.isEmpty()) {
            throw new IllegalArgumentException(
                String.format("Cannot delete category with subcategories (%d). " +
                            "Delete or reassign subcategories first.", 
                            children.size())
            );
        }
        
        categoryRepository.deleteById(id);
        log.info("Successfully deleted category: {}", id);
    }

    // ========== Product Management ==========

    @Transactional
    public void removeProduct(Integer productId, User admin) {
        log.info("Admin {} removing product: {}", admin.getId(), productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        
        // Log moderation action before deletion
        productModerationService.logModerationAction(product, admin, "REMOVE", "Product removed by admin");
        
        productRepository.deleteById(productId);
    }

    @Transactional
    public void takeDownProduct(Integer productId, User admin, String reason) {
        log.info("Admin {} taking down product: {}", admin.getId(), productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        product.setStatus(ProductStatus.REMOVED);
        productRepository.save(product);
        
        // Log moderation action
        productModerationService.logModerationAction(product, admin, "TAKE_DOWN", reason);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getAllProductsForAdmin(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(ProductMapper::toDto);
    }

    // ========== User Management ==========

    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserMapper::toDto);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return UserMapper.toDto(user);
    }

    @Transactional
    public UserDto updateUserStatus(Integer userId, String status) {
        log.info("Admin updating user {} status to {}", userId, status);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setStatus(status);
        user = userRepository.save(user);
        return UserMapper.toDto(user);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        log.info("Admin deleting user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        // Check for critical dependencies that prevent deletion
        long productCount = productRepository.countBySellerId(userId);
        long orderCount = orderRepository.countByBuyerIdOrSellerId(userId);
        long bidCount = bidRepository.countByBidderId(userId);
        
        if (productCount > 0 || orderCount > 0 || bidCount > 0) {
            throw new IllegalArgumentException(
                String.format("Cannot delete user with existing products (%d), orders (%d), or bids (%d). " +
                            "Consider deactivating the user instead by updating their status.", 
                            productCount, orderCount, bidCount)
            );
        }
        
        // Delete user (cascading will handle related records with ON DELETE CASCADE)
        userRepository.deleteById(userId);
        log.info("Successfully deleted user: {}", userId);
    }

    // ========== Seller Upgrade Request Management ==========

    @Transactional(readOnly = true)
    public List<SellerUpgradeRequestDto> getPendingSellerUpgradeRequests() {
        return sellerUpgradeRequestRepository.findByStatus(ApproveStatus.PENDING)
                .stream()
                .map(SellerUpgradeRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SellerUpgradeRequestDto approveSellerUpgradeRequest(User admin, Integer requestId) {
        log.info("Admin approving seller upgrade request: {}", requestId);
        SellerUpgradeRequest request =
                sellerUpgradeRequestRepository.findById(requestId)
                        .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        if (request.getStatus() != ApproveStatus.PENDING) {
            throw new SellerUpgradeBadRequestException(
                    "Request already processed"
            );
        }

        request.setStatus(ApproveStatus.APPROVED);
        request.setProcessedAt(new Date());
        request.setProcessedByAdmin(admin);

        User user = request.getUser();
        Role sellerRole = roleRepository.findByName("SELLER")
                .orElseThrow(() -> new EntityNotFoundException("Seller role not found"));

        if (!user.getRoles().contains(sellerRole)) {
            user.getRoles().add(sellerRole);
        }


        return SellerUpgradeRequestMapper.toDto(sellerUpgradeRequestRepository.save(request));
    }

    @Transactional
    public SellerUpgradeRequestDto rejectSellerUpgradeRequest(Integer requestId) {
        log.info("Admin rejecting seller upgrade request: {}", requestId);
        SellerUpgradeRequest request = sellerUpgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Seller upgrade request not found"));
        
        if (request.getStatus() != ApproveStatus.PENDING) {
            throw new IllegalArgumentException("Request is not pending");
        }
        
        request.setStatus(ApproveStatus.REJECTED);
        request = sellerUpgradeRequestRepository.save(request);
        
        return SellerUpgradeRequestMapper.toDto(request);
    }

    // ========== Dashboard Statistics ==========

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByStatus(ProductStatus.ACTIVE);
        long totalOrders = orderRepository.count();
        long totalBids = bidRepository.count();
        
        // Products ending in next 24 hours
        LocalDateTime next24Hours = LocalDateTime.now().plusHours(24);
        long endingSoon = productRepository.countByEndTimeBetween(LocalDateTime.now(), next24Hours);
        
        // Pending seller upgrade requests
        long pendingSellerRequests = sellerUpgradeRequestRepository.countByStatus(ApproveStatus.PENDING);
        
        return AdminDashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .totalOrders(totalOrders)
                .totalBids(totalBids)
                .endingSoonProducts(endingSoon)
                .pendingSellerRequests(pendingSellerRequests)
                .build();
    }
}

