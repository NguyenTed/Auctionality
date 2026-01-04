package com.team2.auctionality.service;

import com.team2.auctionality.dto.OrderDto;
import com.team2.auctionality.enums.OrderStatus;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            @Lazy ProductService productService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productService = productService;
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Integer id) {
        log.debug("Getting order by id: {}", id);
        return orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public Order getOrderByProductId(Integer productId) {
        Product product = productService.getProductById(productId);
        return orderRepository.findByProduct(product)
                .orElseThrow(() -> new EntityNotFoundException("Order with product " + productId + " not found"));
    }

    @Transactional
    public Order createOrderForBuyNow(Product product, Integer buyerId, Float price) {
        // Validate buyer exists
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new EntityNotFoundException("Buyer not found with ID: " + buyerId));
        
        // Validate product has seller
        if (product.getSeller() == null) {
            throw new IllegalArgumentException("Product must have a seller");
        }
        
        // Validate price
        if (price == null || price <= 0) {
            throw new IllegalArgumentException("Order price must be greater than 0");
        }

        Order order = Order.builder()
                .product(product)
                .buyer(buyer)
                .seller(product.getSeller())
                .finalPrice(price)
                .status(OrderStatus.PENDING)
                .createdAt(new Date())
                .build();

        Order savedOrder = orderRepository.save(order);
        log.info("Created order {} for product {} with buyer {} and price {}", 
                savedOrder.getId(), product.getId(), buyerId, price);
        return savedOrder;
    }

    public Page<Order> getOrders(User user, Boolean isSeller, Pageable pageable) {
        return orderRepository.findOrders(user, isSeller, pageable);
    }
}
