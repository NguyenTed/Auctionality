package com.team2.auctionality.service;

import com.team2.auctionality.enums.OrderStatus;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

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

}
