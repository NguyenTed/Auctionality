package com.team2.auctionality.validation;

import com.team2.auctionality.annotation.ValidBuyNowPrice;
import com.team2.auctionality.dto.CreateProductDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class BuyNowPriceValidator implements ConstraintValidator<ValidBuyNowPrice, CreateProductDto> {

    @Override
    public boolean isValid(CreateProductDto dto, ConstraintValidatorContext context) {
        if (dto == null || dto.getStartPrice() == null) {
            return true; // Let @NotNull handle null checks
        }

        // If buyNowPrice is provided, it must be greater than startPrice
        if (dto.getBuyNowPrice() != null && dto.getBuyNowPrice() <= dto.getStartPrice()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Buy now price must be greater than start price")
                    .addPropertyNode("buyNowPrice")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}

