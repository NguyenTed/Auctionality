package com.team2.auctionality.validation;

import com.team2.auctionality.annotation.ValidEndTime;
import com.team2.auctionality.dto.CreateProductDto;
import com.team2.auctionality.dto.UpdateProductDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDateTime;

public class EndTimeValidator implements ConstraintValidator<ValidEndTime, Object> {

    @Override
    public boolean isValid(Object dto, ConstraintValidatorContext context) {
        if (dto == null) {
            return true; // Let @NotNull handle null checks
        }

        LocalDateTime startTime;
        LocalDateTime endTime;

        // Handle both CreateProductDto and UpdateProductDto
        if (dto instanceof CreateProductDto) {
            CreateProductDto createDto = (CreateProductDto) dto;
            startTime = createDto.getStartTime();
            endTime = createDto.getEndTime();
        } else if (dto instanceof UpdateProductDto) {
            UpdateProductDto updateDto = (UpdateProductDto) dto;
            startTime = updateDto.getStartTime();
            endTime = updateDto.getEndTime();
        } else {
            // Unknown type, skip validation
            return true;
        }

        if (startTime == null || endTime == null) {
            return true; // Let @NotNull handle null checks
        }

        LocalDateTime now = LocalDateTime.now();

        // End time must be after start time
        if (!endTime.isAfter(startTime)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("End time must be after start time")
                    .addPropertyNode("endTime")
                    .addConstraintViolation();
            return false;
        }

        // Start time should be in the future (or very recent past for testing)
        // For updates, we allow past start times if the product already started
        if (dto instanceof CreateProductDto && startTime.isBefore(now.minusMinutes(5))) {
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

