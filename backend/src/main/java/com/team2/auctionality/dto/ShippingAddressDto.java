package com.team2.auctionality.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddressDto {
    private Integer id;
    private Integer orderId;
    private String receiverName;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String country;
    private String postalCode;
}

