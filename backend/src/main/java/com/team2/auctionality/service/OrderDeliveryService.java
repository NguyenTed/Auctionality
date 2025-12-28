package com.team2.auctionality.service;

import com.team2.auctionality.enums.OrderStatus;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Shipment;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.ShipmentRepository;
import com.team2.auctionality.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class OrderDeliveryService {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;

    @Transactional
    public void deliver(Integer orderId, User buyer) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AccessDeniedException("Not buyer");
        }

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new IllegalStateException("Order not shipping");
        }

        Shipment shipment = shipmentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found."));

        shipment.setDeliveredAt(new Date());
        shipmentRepository.save(shipment);

        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);
    }
}

