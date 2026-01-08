package com.team2.auctionality.service;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.exception.AuthException;
import com.team2.auctionality.exception.EmailAlreadyExistsException;
import com.team2.auctionality.exception.InvalidCredentialsException;
import com.team2.auctionality.exception.SellerUpgradeBadRequestException;
import com.team2.auctionality.mapper.UserMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final WatchListItemService watchListItemService;
    private final ProductService productService;
    private final SellerUpgradeRequestRepository sellerUpgradeRequestRepository;
    private final OrderRatingRepository orderRatingRepository;
    private final RoleRepository roleRepository;
    private final OrderService orderService;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Transactional
    public WatchListItem addWatchList(User user, Integer productId) {
        log.debug("User {} adding product {} to watchlist", user.getId(), productId);
        Product product = productService.getProductById(productId);
        WatchListItem watchListItem = WatchListItem.builder()
                .user(user)
                .product(product)
                .createdAt(new Date())
                .build();
        return watchListItemService.createWatchListItem(watchListItem);
    }

    @Transactional
    public void deleteWatchList(Integer userId, Integer productId) {
        log.debug("User {} removing product {} from watchlist", userId, productId);
        watchListItemService.deleteWatchListItem(userId, productId);
    }

    @Transactional
    public SellerUpgradeRequest createSellerUpgradeRequest(User user) {

        log.info("User {} requesting seller upgrade", user.getId());

        boolean existsPending =
                sellerUpgradeRequestRepository.existsByUserAndStatus(
                        user,
                        ApproveStatus.PENDING
                );

        if (existsPending) {
            throw new SellerUpgradeBadRequestException(
                    "You already have a pending seller upgrade request"
            );
        }

        SellerUpgradeRequest sellerUpgradeRequest = SellerUpgradeRequest.builder()
                .user(user)
                .status(ApproveStatus.PENDING)
                .requestedAt(new Date())
                .build();

        return sellerUpgradeRequestRepository.save(sellerUpgradeRequest);
    }

    @Transactional
    public SellerUpgradeRequest approveSellerUpgradeRequest(User admin, Integer requestId) {
        SellerUpgradeRequest request =
                sellerUpgradeRequestRepository.findById(requestId)
                        .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        if (request.getStatus() != ApproveStatus.PENDING) {
            throw new SellerUpgradeBadRequestException(
                    "Request already processed"
            );
        }

        request.setStatus(ApproveStatus.APPROVED);
        request.setProcessedAt(new Date());
        request.setProcessedByAdmin(admin);

        User user = request.getUser();
        Role sellerRole = roleRepository.findByName("SELLER")
                .orElseThrow(() -> new EntityNotFoundException("Seller role not found"));

        if (!user.getRoles().contains(sellerRole)) {
            user.getRoles().add(sellerRole);
        }

        userRepository.save(user);

        return sellerUpgradeRequestRepository.save(request);
    }

    @Transactional
    public SellerUpgradeRequest rejectSellerUpgradeRequest(User admin, Integer requestId) {
        SellerUpgradeRequest request =
                sellerUpgradeRequestRepository.findById(requestId)
                        .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        if (request.getStatus() != ApproveStatus.PENDING) {
            throw new SellerUpgradeBadRequestException(
                    "Request already processed"
            );
        }

        request.setStatus(ApproveStatus.REJECTED);
        request.setProcessedAt(new Date());
        request.setProcessedByAdmin(admin);

        return sellerUpgradeRequestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<OrderRating> getOrderRatings(User user) {
        log.debug("Getting ratings for user: {}", user.getId());
        return orderRatingRepository.getOrderRatingByToUser(user);
    }

    @Transactional(readOnly = true)
    public List<Product> getAuctionProducts(User user) {
        log.debug("Getting auction products for user: {}", user.getId());
        return productService.getAuctionProductsByUser(user.getId());
    }

    @Transactional(readOnly = true)
    public List<Product> getWonProducts(User user) {
        log.debug("Getting won products for user: {}", user.getId());
        return productService.getWonProducts(user);
    }

    @Transactional
    public OrderRating rateUser(User user, RatingRequest ratingRequest) {
        log.info("User {} rating order {}", user.getId(), ratingRequest.getOrderId());

        Order order = orderService.getOrderById(ratingRequest.getOrderId());

        OrderRating orderRating = orderRatingRepository
                .findByOrderIdAndFromUser(ratingRequest.getOrderId(), user)
                .orElse(null);

        boolean isNewRating = false;
        Integer oldValue = null;

        if (orderRating == null) {
            orderRating = new OrderRating();
            orderRating.setOrderId(order.getId());
            orderRating.setFromUser(user);
            orderRating.setCreatedAt(new Date());
            isNewRating = true;
        } else {
            oldValue = orderRating.getValue();
        }

        User toUser = ratingRequest.getIsBuyer()
                ? order.getSeller()
                : order.getBuyer();
        orderRating.setToUser(toUser);

        if (ratingRequest.getComment() != null) {
            orderRating.setComment(ratingRequest.getComment());
        }

        Integer newValue = ratingRequest.getValue(); // 1 = positive, -1 = negative
        orderRating.setValue(newValue);

        UserProfile userProfile = userProfileRepository.findByUserId(toUser.getId());

        // ===== Update counter =====
        if (isNewRating) {
            if (newValue == 1) {
                userProfile.setRatingPositiveCount(userProfile.getRatingPositiveCount() + 1);
            } else {
                userProfile.setRatingNegativeCount(userProfile.getRatingNegativeCount() + 1);
            }
        } else if (!newValue.equals(oldValue)) {
            if (oldValue == 1) {
                userProfile.setRatingPositiveCount(userProfile.getRatingPositiveCount() - 1);
            } else {
                userProfile.setRatingNegativeCount(userProfile.getRatingNegativeCount() - 1);
            }

            if (newValue == 1) {
                userProfile.setRatingPositiveCount(userProfile.getRatingPositiveCount() + 1);
            } else {
                userProfile.setRatingNegativeCount(userProfile.getRatingNegativeCount() + 1);
            }
        }

        // ===== Caculate ratingPercent =====
        int positive = userProfile.getRatingPositiveCount();
        int negative = userProfile.getRatingNegativeCount();
        int total = positive + negative;

        float ratingPercent = total == 0 ? 0f : (float) positive / total;
        userProfile.setRatingPercent(ratingPercent);

        userProfileRepository.save(userProfile);
        return orderRatingRepository.save(orderRating);
    }

    @Transactional(readOnly = true)
    public List<WatchListItemDto> getWatchList(User user) {
        log.debug("Getting watchlist for user: {}", user.getId());
        return watchListItemService.getWatchList(user);
    }

    @Transactional
    public UserDto updateProfile(User user, UpdateProfileRequest request) {
        log.info("User {} updating profile", user.getId());

        // Update email if provided and different
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new EmailAlreadyExistsException(request.getEmail());
            }
            user.setEmail(request.getEmail());
            user.setIsEmailVerified(false); // Require re-verification when email changes
        }

        // Update profile information
        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
        }

        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName());
        }

        if (request.getPhoneNumber() != null) {
            profile.setPhoneNumber(request.getPhoneNumber());
        }

        user = userRepository.save(user);
        return UserMapper.toDto(user);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        log.info("User {} changing password", user.getId());

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

}
