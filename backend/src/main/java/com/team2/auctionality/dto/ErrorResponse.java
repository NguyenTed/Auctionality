package com.team2.auctionality.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class ErrorResponse {
    private Object message;
    private int status;
    private Instant timestamp;
}
