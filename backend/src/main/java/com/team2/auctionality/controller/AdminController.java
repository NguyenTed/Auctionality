package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.*;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.AdminService;
import com.team2.auctionality.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

/**
 * Admin controller for managing categories, products, users, and seller upgrade requests
 * All endpoints require ADMIN role
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin API")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ========== Dashboard ==========

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ========== Category Management ==========

    @PostMapping("/categories")
    @Operation(summary = "Create a new category")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CreateCategoryDto dto) {
        log.info("Admin creating category: {}", dto.getName());
        CategoryDto category = adminService.createCategory(dto);
        URI location = URI.create("/api/admin/categories/" + category.getId());
        return ResponseEntity.created(location).body(category);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateCategoryDto dto
    ) {
        log.info("Admin updating category: {}", id);
        CategoryDto category = adminService.updateCategory(id, dto);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        log.info("Admin deleting category: {}", id);
        adminService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Product Management ==========

    @GetMapping("/products")
    @Operation(summary = "Get all products (admin view)")
    public PagedResponse<ProductDto> getAllProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ProductDto> products = adminService.getAllProductsForAdmin(PaginationUtils.createPageable(page, size));
        return PaginationMapper.from(products);
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Remove a product (admin)")
    public ResponseEntity<Void> removeProduct(
            @PathVariable Integer id,
            @CurrentUser User admin
    ) {
        log.info("Admin {} removing product: {}", admin.getId(), id);
        adminService.removeProduct(id, admin);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/products/{id}/take-down")
    @Operation(summary = "Take down a product (suspend)")
    public ResponseEntity<Void> takeDownProduct(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> request,
            @CurrentUser User admin
    ) {
        String reason = request != null ? request.get("reason") : null;
        log.info("Admin {} taking down product: {}", admin.getId(), id);
        adminService.takeDownProduct(id, admin, reason);
        return ResponseEntity.ok().build();
    }

    // ========== User Management ==========

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public PagedResponse<UserDto> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDto> users = adminService.getAllUsers(PaginationUtils.createPageable(page, size));
        return PaginationMapper.from(users);
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update user status")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request
    ) {
        String status = request.get("status");
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        return ResponseEntity.ok(adminService.updateUserStatus(id, status));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        log.info("Admin deleting user: {}", id);
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Seller Upgrade Request Management ==========

    @GetMapping("/seller-upgrade-requests")
    @Operation(summary = "Get pending seller upgrade requests")
    public ResponseEntity<List<SellerUpgradeRequestDto>> getPendingSellerUpgradeRequests() {
        return ResponseEntity.ok(adminService.getPendingSellerUpgradeRequests());
    }

    @PostMapping("/seller-upgrade-requests/{id}/approve")
    @Operation(summary = "Approve a seller upgrade request")
    public ResponseEntity<SellerUpgradeRequestDto> approveSellerUpgradeRequest(@PathVariable Integer id, @CurrentUser User admin) {
        log.info("Admin approving seller upgrade request: {}", id);
        return ResponseEntity.ok(adminService.approveSellerUpgradeRequest(admin, id));
    }

    @PostMapping("/seller-upgrade-requests/{id}/reject")
    @Operation(summary = "Reject a seller upgrade request")
    public ResponseEntity<SellerUpgradeRequestDto> rejectSellerUpgradeRequest(@PathVariable Integer id) {
        log.info("Admin rejecting seller upgrade request: {}", id);
        return ResponseEntity.ok(adminService.rejectSellerUpgradeRequest(id));
    }
}

