package com.team2.auctionality.repository;

import com.team2.auctionality.model.SocialLoginAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialLoginAccountRepository extends JpaRepository<SocialLoginAccount, Integer> {
    Optional<SocialLoginAccount> findByProviderAndProviderUserId(String provider, String providerUserId);
}

