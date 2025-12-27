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

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    @Value("${vnpay.url}")
    private String vnpUrl;

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.secret-key}")
    private String secretKey;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    private String generatePaymentUrl(Payment payment, Float price, HttpServletRequest req) throws UnsupportedEncodingException {

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amount = Math.round(price * 100);
        String bankCode = req.getParameter("bankCode");

        String vnp_TxnRef = PaymentConfig.getRandomNumber(8);
        String vnp_IpAddr = PaymentConfig.getIpAddress(req);

        String vnp_TmnCode = PaymentConfig.vnp_TmnCode;

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
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        String locate = req.getParameter("language");
        if (locate != null && !locate.isEmpty()) {
            vnp_Params.put("vnp_Locale", locate);
        } else {
            vnp_Params.put("vnp_Locale", "vn");
        }
        vnp_Params.put("vnp_ReturnUrl", PaymentConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

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
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = PaymentConfig.hmacSHA512(PaymentConfig.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        System.out.println(hashData);
        String paymentUrl = PaymentConfig.vnp_PayUrl + "?" + queryUrl;
        System.out.println(paymentUrl);
        System.out.println(vnp_SecureHash);
        return paymentUrl;
    }



    @Transactional
    public String createVnPayPayment(Order order, HttpServletRequest request) throws UnsupportedEncodingException {

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

    public void processVnPayReturn(HttpServletRequest request) {

        // 1. Lấy RAW query string (VNPay ký trên cái này)
        String queryString = request.getQueryString();
        if (queryString == null || queryString.isEmpty()) {
            throw new IllegalArgumentException("Empty VNPay return data");
        }

        // 2. Parse KHÔNG decode
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

        // 3. Lấy & remove hash
        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        if (secureHash == null) {
            throw new IllegalArgumentException("Missing VNPay secure hash");
        }

        // 4. Build raw data để verify (SORT + NO ENCODE)
        String rawData = params.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));

        // 5. Verify chữ ký
        String calculatedHash = hmacSHA512(rawData);
        if (!calculatedHash.equalsIgnoreCase(secureHash)) {
            throw new IllegalArgumentException("Invalid VNPay signature");
        }

        // 6. Business logic
        Integer paymentId = Integer.valueOf(params.get("vnp_TxnRef"));
        String responseCode = params.get("vnp_ResponseCode");

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(EntityNotFoundException::new);

        if (payment.getStatus() == PaymentStatus.PAID) {
            return; // idempotent
        }

        if ("00".equals(responseCode)) {
            payment.setStatus(PaymentStatus.PAID);

            Order order = orderRepository.findById(payment.getOrderId())
                    .orElseThrow(EntityNotFoundException::new);
            order.setStatus(OrderStatus.COMPLETED);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
    }


    /* ===== helper ===== */

    private String buildHashData(Map<String, String> params) {
        return params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    private String buildQuery(Map<String, String> params) {
        return params.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> entry.getKey() + "=" + urlEncode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String buildRawQuery(Map<String, String> params) {
        return params.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));
    }


    private String urlEncode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String hmacSHA512(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(secretKey.getBytes(), "HmacSHA512"));

            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
