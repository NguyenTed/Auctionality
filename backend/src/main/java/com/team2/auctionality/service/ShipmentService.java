package com.team2.auctionality.service;

import com.team2.auctionality.enums.OrderStatus;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Shipment;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.ShipmentRepository;
import com.team2.auctionality.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public void ship(Integer orderId, User seller) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new AccessDeniedException("Not seller");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new IllegalStateException("Order not ready to ship");
        }

        Shipment shipment = Shipment.builder()
                .orderId(order.getId())
                .carrier(randomCarrier())
                .trackingNumber(randomTracking())
                .shippedAt(new Date())
                .build();

        shipmentRepository.save(shipment);

        order.setStatus(OrderStatus.SHIPPING);
        orderRepository.save(order);
    }

    private String randomCarrier() {
        return List.of("GHN", "GHTK", "VNPost", "J&T")
                .get(new Random().nextInt(4));
    }

    private String randomTracking() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}