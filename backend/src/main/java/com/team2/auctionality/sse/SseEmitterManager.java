package com.team2.auctionality.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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
                emitter.send(
                        SseEmitter.event()
                                .name("bid-history")
                                .data(data)
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

