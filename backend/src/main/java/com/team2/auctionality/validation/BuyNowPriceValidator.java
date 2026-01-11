package com.team2.auctionality.validation;

import com.team2.auctionality.annotation.ValidBuyNowPrice;
import com.team2.auctionality.dto.CreateProductDto;
import com.team2.auctionality.dto.UpdateProductDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class BuyNowPriceValidator implements ConstraintValidator<ValidBuyNowPrice, Object> {

    @Override
    public boolean isValid(Object dto, ConstraintValidatorContext context) {
        if (dto == null) {
            return true; // Let @NotNull handle null checks
        }

        Float startPrice;
        Float buyNowPrice;

        // Handle both CreateProductDto and UpdateProductDto
        if (dto instanceof CreateProductDto) {
            CreateProductDto createDto = (CreateProductDto) dto;
            startPrice = createDto.getStartPrice();
            buyNowPrice = createDto.getBuyNowPrice();
        } else if (dto instanceof UpdateProductDto) {
            UpdateProductDto updateDto = (UpdateProductDto) dto;
            startPrice = updateDto.getStartPrice();
            buyNowPrice = updateDto.getBuyNowPrice();
        } else {
            // Unknown type, skip validation
            return true;
        }

        if (startPrice == null) {
            return true; // Let @NotNull handle null checks
        }

        // If buyNowPrice is provided, it must be greater than startPrice
        if (buyNowPrice != null && buyNowPrice <= startPrice) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Buy now price must be greater than start price")
                    .addPropertyNode("buyNowPrice")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}

