package com.team2.auctionality.util;

/**
 * Constants for payment processing
 */
public final class PaymentConstants {
    private PaymentConstants() {
        // Utility class - prevent instantiation
    }

    public static final String VNPAY_VERSION = "2.1.0";
    public static final String VNPAY_COMMAND = "pay";
    public static final String VNPAY_ORDER_TYPE = "other";
    public static final String VNPAY_CURRENCY = "VND";
    public static final String VNPAY_LOCALE = "vn";
    public static final String VNPAY_SUCCESS_RESPONSE_CODE = "00";
    public static final int VNPAY_EXPIRY_MINUTES = 15;
    public static final String VNPAY_TIMEZONE = "Etc/GMT+7";
}

