package com.team2.auctionality.exception;

public class EmailAlreadyExistsException extends AuthException {
    public EmailAlreadyExistsException(String email) {
        super("Email already exists: " + email);
    }
}

