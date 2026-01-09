package com.team2.auctionality.repository;

import com.team2.auctionality.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"profile", "roles"})
    Page<User> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {
            "profile",
            "roles",
            "socialLoginAccounts"
    })
    Optional<User> findById(Integer id);
}

