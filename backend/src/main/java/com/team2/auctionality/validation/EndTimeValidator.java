package com.team2.auctionality.validation;

import com.team2.auctionality.annotation.ValidEndTime;
import com.team2.auctionality.dto.CreateProductDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDateTime;

public class EndTimeValidator implements ConstraintValidator<ValidEndTime, CreateProductDto> {

    @Override
    public boolean isValid(CreateProductDto dto, ConstraintValidatorContext context) {
        if (dto == null || dto.getStartTime() == null || dto.getEndTime() == null) {
            return true; // Let @NotNull handle null checks
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = dto.getStartTime();
        LocalDateTime endTime = dto.getEndTime();

        // End time must be after start time
        if (!endTime.isAfter(startTime)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("End time must be after start time")
                    .addPropertyNode("endTime")
                    .addConstraintViolation();
            return false;
        }

        // Start time should be in the future (or very recent past for testing)
        if (startTime.isBefore(now.minusMinutes(5))) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Start time must be in the future")
                    .addPropertyNode("startTime")
                    .addConstraintViolation();
            return false;
        }

        // Minimum auction duration: 1 hour
        if (java.time.Duration.between(startTime, endTime).toHours() < 1) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Auction duration must be at least 1 hour")
                    .addPropertyNode("endTime")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}

