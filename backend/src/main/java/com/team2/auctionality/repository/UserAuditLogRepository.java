package com.team2.auctionality.repository;

import com.team2.auctionality.model.UserAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserAuditLogRepository extends JpaRepository<UserAuditLog, Integer> {
    Page<UserAuditLog> findByUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);
    
    @Query("SELECT ual FROM UserAuditLog ual WHERE ual.user.id = :userId AND ual.action = :action ORDER BY ual.createdAt DESC")
    List<UserAuditLog> findByUserIdAndActionOrderByCreatedAtDesc(@Param("userId") Integer userId, @Param("action") String action);
    
    @Query("SELECT ual FROM UserAuditLog ual WHERE ual.createdAt >= :startDate ORDER BY ual.createdAt DESC")
    Page<UserAuditLog> findByCreatedAtAfter(@Param("startDate") LocalDateTime startDate, Pageable pageable);
}

