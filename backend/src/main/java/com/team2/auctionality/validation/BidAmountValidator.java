package com.team2.auctionality.validation;

import com.team2.auctionality.exception.InvalidBidPriceException;
import org.springframework.stereotype.Component;

/**
 * Validator for bid amount validation
 * Ensures bid amount follows business rules
 */
@Component
public class BidAmountValidator {

    /**
     * Validates that the bid amount is valid according to business rules
     *
     * @param amount       The bid amount to validate
     * @param step         The bid increment step
     * @param currentPrice The current highest price
     * @throws InvalidBidPriceException if validation fails
     */
    public void validateBidAmount(Float amount, Float step, Float currentPrice) {
        if (amount <= currentPrice) {
            throw new InvalidBidPriceException("Bid amount must be greater than current price: " + currentPrice);
        }
        if ((amount - currentPrice) % step != 0) {
            throw new InvalidBidPriceException(
                    "Bid price must increase by step of " + step
            );
        }
    }
}

