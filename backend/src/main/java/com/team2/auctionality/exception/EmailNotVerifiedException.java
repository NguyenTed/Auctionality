package com.team2.auctionality.exception;

public class EmailNotVerifiedException extends AuthException {
    public EmailNotVerifiedException() {
        super("Email not verified. Please verify your email before logging in.");
    }
}

