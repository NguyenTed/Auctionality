package com.team2.auctionality.service;

import com.team2.auctionality.dto.ShippingAddressRequest;
import com.team2.auctionality.enums.OrderStatus;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.ShippingAddress;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.ShippingAddressRepository;
import com.team2.auctionality.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShippingAddressService {

    private final OrderRepository orderRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createShippingAddress(
            Integer orderId,
            ShippingAddressRequest req,
            User buyer
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        if (!order.getBuyer().getId().equals(buyer.getId())) {
            throw new AccessDeniedException("Not buyer");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new IllegalStateException("Order not paid");
        }

        ShippingAddress address = ShippingAddress.builder()
                .orderId(order.getId())
                .receiverName(req.getReceiverName())
                .phone(req.getPhone())
                .addressLine1(req.getAddressLine1())
                .addressLine2(req.getAddressLine2())
                .city(req.getCity())
                .country(req.getCountry())
                .postalCode(req.getPostalCode())
                .build();

        shippingAddressRepository.save(address);
    }
}