package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.ApiResponse;
import com.team2.auctionality.dto.OrderDto;
import com.team2.auctionality.dto.PagedResponse;
import com.team2.auctionality.dto.ShippingAddressRequest;
import com.team2.auctionality.mapper.OrderMapper;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.OrderService;
import com.team2.auctionality.service.ShipmentService;
import com.team2.auctionality.service.ShippingAddressService;
import com.team2.auctionality.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order", description = "Order API")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    private final OrderService orderService;
    private final ShippingAddressService shippingAddressService;
    private final ShipmentService shipmentService;

    @GetMapping
    @Operation(summary = "Get orders for seller/buyer")
    public PagedResponse<OrderDto> getOrders(
            @RequestParam(defaultValue = "false") boolean isSeller,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @CurrentUser User user
    ) {
        log.debug("User {} getting orders (isSeller: {})", user.getId(), isSeller);
        Page<OrderDto> orders = orderService
                                    .getOrders(user, isSeller, PaginationUtils.createPageable(page, size))
                                    .map(OrderMapper::toDto);
        return PaginationMapper.from(orders);
    }

    @PostMapping("/{orderId}/shipping-address")
    @Operation(summary = "Add shipping address")
    public ResponseEntity<ApiResponse<Void>> createShippingAddress(
            @PathVariable Integer orderId,
            @RequestBody ShippingAddressRequest request,
            @CurrentUser User user
    ) {
        log.info("User {} adding shipping address to order {}", user.getId(), orderId);
        shippingAddressService.createShippingAddress(orderId, request, user);
        return ResponseEntity.ok(new ApiResponse<>("Shipping address added successfully", null));
    }

    @PostMapping("/{orderId}/ship")
    @Operation(summary = "Create shipment")
    public ResponseEntity<ApiResponse<Void>> shipOrder(
            @PathVariable Integer orderId,
            @CurrentUser User user
    ) {
        log.info("User {} shipping order {}", user.getId(), orderId);
        shipmentService.ship(orderId, user);
        return ResponseEntity.ok(new ApiResponse<>("Order shipped successfully", null));
    }
}
