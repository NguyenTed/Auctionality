package com.team2.auctionality.validation;

import com.team2.auctionality.annotation.ValidRatingValue;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RatingValueValidator
        implements ConstraintValidator<ValidRatingValue, Integer> {

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        return value != null && (value == 1 || value == -1);
    }
}

