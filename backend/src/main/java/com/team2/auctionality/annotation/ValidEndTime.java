package com.team2.auctionality.annotation;

import com.team2.auctionality.validation.EndTimeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = EndTimeValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEndTime {
    String message() default "End time must be after start time and at least 1 hour in the future";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}