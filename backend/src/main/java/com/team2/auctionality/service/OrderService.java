package com.team2.auctionality.service;

import com.team2.auctionality.dto.CancelOrderRequestDto;
import com.team2.auctionality.dto.OrderDto;
import com.team2.auctionality.dto.TransactionCancellationDto;
import com.team2.auctionality.enums.OrderStatus;
import com.team2.auctionality.exception.CancelOrderBadRequestException;
import com.team2.auctionality.mapper.TransactionCancellationMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.PaymentRepository;
import com.team2.auctionality.repository.TransactionCancellationRepository;
import com.team2.auctionality.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TransactionCancellationRepository transactionCancellationRepository;
    private final PaymentRepository paymentRepository;
    private final ProductService productService;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            TransactionCancellationRepository transactionCancellationRepository,
            PaymentRepository paymentRepository,
            @Lazy ProductService productService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.transactionCancellationRepository = transactionCancellationRepository;
        this.paymentRepository = paymentRepository;
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

        Optional<Order> existingOrder =
                orderRepository.findByBuyerIdAndProductId(buyerId, product.getId());

        if (existingOrder.isPresent()) {
            log.warn("Order already exists for buyer {} and product {}",
                    buyerId, product.getId());

            return existingOrder.get();
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

    @Transactional
    public TransactionCancellationDto cancelOrder(Integer orderId, CancelOrderRequestDto cancelOrderRequestDto, User user) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new EntityNotFoundException("Order " + orderId + " not found"));
        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (payment != null && !payment.getStatus().equals(OrderStatus.PENDING)) {
            throw new CancelOrderBadRequestException("Payment is not PENDING to be canceled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        TransactionCancellation transactionCancellation = TransactionCancellation.builder()
                .reason(cancelOrderRequestDto.getReason())
                .cancelledByUser(user)
                .createdAt(new Date())
                .build();
        return TransactionCancellationMapper.toDto(transactionCancellationRepository.save(transactionCancellation));
    }
}
