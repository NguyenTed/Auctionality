package com.team2.auctionality.repository;

import com.team2.auctionality.model.OrderRating;
import com.team2.auctionality.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRatingRepository extends JpaRepository<OrderRating, Integer> {
    List<OrderRating> getOrderRatingByToUser(User user);

    Optional<OrderRating> findByOrderIdAndFromUser(Integer orderId, User user);
}
