package com.team2.auctionality.service;

import com.team2.auctionality.config.PaymentConfig;
import com.team2.auctionality.enums.OrderStatus;
import com.team2.auctionality.enums.PaymentGateway;
import com.team2.auctionality.enums.PaymentStatus;
import com.team2.auctionality.exception.AuthException;
import com.team2.auctionality.model.Order;
import com.team2.auctionality.model.Payment;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.OrderRepository;
import com.team2.auctionality.repository.PaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${vnpay.url}")
    private String vnp_PayUrl;

    @Value("${vnpay.return-url}")
    private String vnp_ReturnUrl;

    @Value("${vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${vnpay.secret-key}")
    private String secretKey;

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    private String generatePaymentUrl(Payment payment, Float price, HttpServletRequest req) throws UnsupportedEncodingException {

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amount = Math.round(price * 1000);
        String bankCode = req.getParameter("bankCode");

        String vnp_TxnRef = payment.getId().toString();
        String vnp_IpAddr = "127.0.0.1";

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = PaymentConfig.hmacSHA512(secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnp_PayUrl + "?" + queryUrl;
        return paymentUrl;
    }



    @Transactional
    protected String createVnPayPayment(Order order, HttpServletRequest request) throws UnsupportedEncodingException {

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);

        if (payment == null) {
            payment = Payment.builder()
                    .orderId(order.getId())
                    .gateway(PaymentGateway.VNPAY)
                    .currency("VND")
                    .status(PaymentStatus.UNPAID)
                    .build();
        }

        paymentRepository.save(payment);

        return generatePaymentUrl(payment, order.getFinalPrice(), request);
    }

    @Transactional
    public String getPaymentUrl(User user, Integer productId, HttpServletRequest request) throws UnsupportedEncodingException {
        Order order = orderRepository
                .findByProductIdAndBuyerId(productId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (!order.getBuyer().getId().equals(user.getId())) {
            throw new AuthException("User cannot pay this order");
        }

        return createVnPayPayment(order,request);
    }

    @Transactional
    public void processVnPayReturn(HttpServletRequest request) {

        // 1. GET RAW query string (VNPay sign this)
        String queryString = request.getQueryString();
        if (queryString == null || queryString.isEmpty()) {
            throw new IllegalArgumentException("Empty VNPay return data");
        }

        // 2. Parse NO decode
        Map<String, String> params = new HashMap<>();
        for (String pair : queryString.split("&")) {
            int idx = pair.indexOf('=');
            if (idx > 0) {
                params.put(
                        pair.substring(0, idx),
                        pair.substring(idx + 1)
                );
            }
        }

        // 3. Get & remove hash
        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        if (secureHash == null) {
            throw new IllegalArgumentException("Missing VNPay secure hash");
        }

        // 4. Build raw data to verify (SORT + NO ENCODE)
        String rawData = params.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));

        // 5. Verify signature
        String calculatedHash = PaymentConfig.hmacSHA512(secretKey, rawData);
        if (!calculatedHash.equalsIgnoreCase(secureHash)) {
            throw new IllegalArgumentException("Invalid VNPay signature");
        }

        // 6. Business logic
        Integer paymentId = Integer.valueOf(params.get("vnp_TxnRef"));
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found."));
        if (payment.getStatus() == PaymentStatus.PAID) {
            return; // idempotent
        }
        if ("00".equals(responseCode)) {
            // Update Payment
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(new Date());
            payment.setAmount(Float.valueOf(params.get("vnp_Amount"))/ 100);
            payment.setTransactionCode(params.get("vnp_TransactionNo"));

            // Update Order
            Order order = orderRepository.findById(payment.getOrderId())
                    .orElseThrow(EntityNotFoundException::new);
            order.setStatus(OrderStatus.PAID);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
    }
}
