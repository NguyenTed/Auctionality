package com.team2.auctionality.annotation;

import com.team2.auctionality.validation.RatingValueValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = RatingValueValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidRatingValue {

    String message() default "must be 1 or -1";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
