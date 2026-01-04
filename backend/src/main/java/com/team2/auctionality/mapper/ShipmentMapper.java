package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.ShipmentDto;
import com.team2.auctionality.model.Shipment;
import org.springframework.stereotype.Component;

@Component
public class ShipmentMapper {

    public static ShipmentDto toDto(Shipment shipment) {
        if (shipment == null) return null;
        
        return ShipmentDto.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .carrier(shipment.getCarrier())
                .trackingNumber(shipment.getTrackingNumber())
                .shippedAt(shipment.getShippedAt())
                .deliveredAt(shipment.getDeliveredAt())
                .build();
    }
}

