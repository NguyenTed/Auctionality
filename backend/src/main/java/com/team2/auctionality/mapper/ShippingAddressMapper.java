package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.ShippingAddressDto;
import com.team2.auctionality.model.ShippingAddress;
import org.springframework.stereotype.Component;

@Component
public class ShippingAddressMapper {

    public static ShippingAddressDto toDto(ShippingAddress address) {
        if (address == null) return null;
        
        return ShippingAddressDto.builder()
                .id(address.getId())
                .orderId(address.getOrderId())
                .receiverName(address.getReceiverName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .build();
    }
}

