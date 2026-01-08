package com.team2.auctionality.sse;

import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.dto.ProductDto;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SseEmitterManager {

    private final Map<Integer, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Integer productId) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout

        emitters
                .computeIfAbsent(productId, k -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() -> remove(productId, emitter));
        emitter.onTimeout(() -> remove(productId, emitter));
        emitter.onError(e -> remove(productId, emitter));

        return emitter;
    }

    public void send(Integer productId, Object data) {
        List<SseEmitter> productEmitters = emitters.get(productId);
        if (productEmitters == null) return;

        for (SseEmitter emitter : productEmitters) {
            try {
                if (data instanceof List && !((List<?>) data).isEmpty()) {
                    Object firstElement = ((List<?>) data).get(0);
                    if (firstElement instanceof BidHistoryDto) {
                        // Handle list of bid histories
                        emitter.send(
                                SseEmitter.event()
                                        .name("bid-history")
                                        .data(data)
                        );
                    }
                } else if (data instanceof BidHistoryDto) {
                    // Handle single bid history
                    emitter.send(
                            SseEmitter.event()
                                    .name("bid-history")
                                    .data(data)
                    );
                } else if (data instanceof ProductDto) {
                    emitter.send(
                            SseEmitter.event()
                                    .name("product")
                                    .data(data)
                    );
                }
            } catch (Exception e) {
                remove(productId, emitter);
            }
        }
    }

    public void sendProductPriceUpdate(Integer productId, Float newPrice, Float previousPrice) {
        List<SseEmitter> productEmitters = emitters.get(productId);
        if (productEmitters == null) return;

        Map<String, Object> priceData = Map.of(
                "productId", productId,
                "newPrice", newPrice,
                "previousPrice", previousPrice
        );

        for (SseEmitter emitter : productEmitters) {
            try {
                emitter.send(
                        SseEmitter.event()
                                .name("product-price-update")
                                .data(priceData)
                );
            } catch (Exception e) {
                remove(productId, emitter);
            }
        }
    }

    private void remove(Integer productId, SseEmitter emitter) {
        emitters.getOrDefault(productId, List.of()).remove(emitter);
    }
}

