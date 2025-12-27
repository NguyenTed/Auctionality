package com.team2.auctionality.repository;

import com.team2.auctionality.model.RefreshToken;
import com.team2.auctionality.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUserAndRevokedAtIsNull(User user);
    void deleteByUser(User user);
}

