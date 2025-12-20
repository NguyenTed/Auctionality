package com.team2.auctionality.service;

import com.team2.auctionality.model.SystemAuctionRule;
import com.team2.auctionality.repository.SystemAuctionRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemAuctionRuleService {

    private final SystemAuctionRuleRepository repository;

    public Optional<SystemAuctionRule> getActiveRule() {
        return repository.findAll()
                .stream()
                .filter(rule -> Boolean.TRUE.equals(rule.getIsActive()))
                .findFirst();
    }
}
