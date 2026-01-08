package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.*;
import com.team2.auctionality.exception.AuthException;
import com.team2.auctionality.mapper.OrderMapper;
import com.team2.auctionality.mapper.PaginationMapper;
import com.team2.auctionality.mapper.ShipmentMapper;
import com.team2.auctionality.mapper.ShippingAddressMapper;
import com.team2.auctionality.model.Shipment;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.OrderDeliveryService;
import com.team2.auctionality.service.OrderService;
import com.team2.auctionality.service.ShipmentService;
import com.team2.auctionality.service.ShippingAddressService;
import com.team2.auctionality.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
    private final OrderDeliveryService orderDeliveryService;

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

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderDto> getOrderById(
            @PathVariable Integer orderId,
            @CurrentUser User user
    ) {
        log.info("User {} getting order {}", user.getId(), orderId);
        var order = orderService.getOrderById(orderId);

        // Verify user is buyer or seller
        if (!order.getBuyer().getId().equals(user.getId()) &&
            !order.getSeller().getId().equals(user.getId())) {
            throw new AuthException("Not authorized to view this order");
        }

        return ResponseEntity.ok(OrderMapper.toDto(order));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get order by product ID")
    public ResponseEntity<OrderDto> getOrderByProductId(
            @PathVariable Integer productId,
            @CurrentUser User user
    ) {
        log.info("User {} getting order for product {}", user.getId(), productId);
        var order = orderService.getOrderByProductId(productId);

        // Verify user is buyer or seller
        if (!order.getBuyer().getId().equals(user.getId()) &&
            !order.getSeller().getId().equals(user.getId())) {
            throw new AuthException("Not authorized to view this order");
        }

        return ResponseEntity.ok(OrderMapper.toDto(order));
    }

    @DeleteMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order when buyer have not paid yet.")
    public ResponseEntity<TransactionCancellationDto> cancelOrder(
            @PathVariable Integer orderId,
            @RequestBody CancelOrderRequestDto cancelOrderRequestDto,
            @CurrentUser User user
    ) {
        log.info("Called cancel order");
        return ResponseEntity.ok(orderService.cancelOrder(orderId, cancelOrderRequestDto, user));
    }

    @GetMapping("/{orderId}/shipping-address")
    @Operation(summary = "Get shipping address for an order")
    public ResponseEntity<ShippingAddressDto> getShippingAddress(
            @PathVariable Integer orderId,
            @CurrentUser User user
    ) {
        log.info("User {} getting shipping address for order {}", user.getId(), orderId);
        var address = shippingAddressService.getShippingAddress(orderId, user);
        return ResponseEntity.ok(ShippingAddressMapper.toDto(address));
    }

    @GetMapping("/{orderId}/shipment")
    @Operation(summary = "Get shipment information for an order")
    public ResponseEntity<ShipmentDto> getShipment(
            @PathVariable Integer orderId,
            @CurrentUser User user
    ) {
        log.info("User {} getting shipment for order {}", user.getId(), orderId);
        var shipment = shipmentService.getShipment(orderId, user);
        return ResponseEntity.ok(ShipmentMapper.toDto(shipment));
    }

    @PostMapping("/{orderId}/shipping-address")
    @Operation(summary = "Add shipping address")
    public ResponseEntity<ApiResponse<Void>> createShippingAddress(
            @PathVariable Integer orderId,
            @RequestBody @Valid ShippingAddressRequest request,
            @CurrentUser User user
    ) {
        log.info("User {} adding shipping address to order {}", user.getId(), orderId);
        shippingAddressService.createShippingAddress(orderId, request, user);
        return ResponseEntity.ok(new ApiResponse<>("Shipping address added successfully", null));
    }

    @PostMapping("/{orderId}/ship")
    @Operation(summary = "Create shipment")
    public ResponseEntity<ApiResponse<Shipment>> shipOrder(
            @PathVariable Integer orderId,
            @CurrentUser User user
    ) {
        log.info("User {} shipping order {}", user.getId(), orderId);
        Shipment shipment = shipmentService.ship(orderId, user);
        return ResponseEntity.ok(new ApiResponse<>("Order shipped successfully", shipment));
    }

    @PostMapping("/{orderId}/deliver")
    public void deliver(
            @PathVariable Integer orderId,
            @CurrentUser User user
    ) {
        orderDeliveryService.deliver(orderId, user);
    }
}
