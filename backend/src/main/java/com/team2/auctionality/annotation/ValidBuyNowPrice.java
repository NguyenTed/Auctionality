package com.team2.auctionality.annotation;

import com.team2.auctionality.validation.BuyNowPriceValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = BuyNowPriceValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidBuyNowPrice {
    String message() default "Buy now price must be greater than start price";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

