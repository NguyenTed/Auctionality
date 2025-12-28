package com.team2.auctionality.service;

import com.team2.auctionality.dto.OrderDto;
import com.team2.auctionality.enums.OrderStatus;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    public Order getOrderById(Integer id) {
        return orderRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Order " + id + " not found"));
    }

    public Order getOrderByProductId(Integer productId) {
        Product product = productService.getProductById(productId);
        return (Order) orderRepository.findByProduct(product).orElseThrow(
                () -> new EntityNotFoundException("Order with product " + productId + " not found"));
    }

    @Transactional
    public Order createOrderForBuyNow(Product product, Integer buyerId, Float price) {

        Order order = Order.builder()
                .product(product)
                .buyer(userRepository.findById(buyerId).orElse(null))
                .seller(product.getSeller())
                .finalPrice(price)
                .status(OrderStatus.PENDING)
                .createdAt(new Date())
                .build();

        return orderRepository.save(order);
    }

    public Page<Order> getOrders(User user, Boolean isSeller, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findOrders(user, isSeller, pageable);
    }
}
