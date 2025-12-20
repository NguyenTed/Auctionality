package com.team2.auctionality.service;

import com.team2.auctionality.model.Order;
import com.team2.auctionality.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    public Order getOrderById(Integer id) {
        return orderRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Order " + id + " not found"));
    }
}
