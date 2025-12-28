package com.team2.auctionality.controller;

import com.team2.auctionality.dto.OrderDto;
import com.team2.auctionality.dto.PagedResponse;
import com.team2.auctionality.dto.ShippingAddressRequest;
import com.team2.auctionality.mapper.OrderMapper;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.AuthService;
import com.team2.auctionality.service.OrderService;
import com.team2.auctionality.service.ShipmentService;
import com.team2.auctionality.service.ShippingAddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order", description = "Order API")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final AuthService authService;
    private final ShippingAddressService shippingAddressService;
    private final ShipmentService shipmentService;

    @GetMapping
    @Operation(summary = "Get orders for seller/buyer")
    public PagedResponse<OrderDto> getOrders(
            @RequestParam(defaultValue = "false") boolean isSeller,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        Page<OrderDto> orders = orderService
                                    .getOrders(user, isSeller, page - 1, size)
                                    .map(OrderMapper::toDto);
        return PaginationMapper.from(orders);
    }

    @PostMapping("/{orderId}/shipping-address")
    @Operation(summary = "Add shipping address")
    public void createShippingAddress(
            @PathVariable Integer orderId,
            @RequestBody ShippingAddressRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        shippingAddressService.createShippingAddress(orderId, request, user);
    }

    @PostMapping("/{orderId}/ship")
    @Operation(summary = "Create shipment")
    public void shipOrder(
            @PathVariable Integer orderId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        shipmentService.ship(orderId, user);
    }
}
