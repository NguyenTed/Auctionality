package com.team2.auctionality.exception;

public class BidNotAllowedException extends BusinessException {
    public BidNotAllowedException(String message) {
        super(message);
    }
}