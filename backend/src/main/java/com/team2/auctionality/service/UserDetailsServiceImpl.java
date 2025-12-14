package com.team2.auctionality.service;

import com.team2.auctionality.model.Permission;
import com.team2.auctionality.model.Role;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(getAuthorities(user))
                .accountExpired(false)
                .accountLocked(!user.getStatus().equals("active"))
                .credentialsExpired(false)
                .disabled(!user.getStatus().equals("active"))
                .build();
    }

    // Build authorities from roles and permissions
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return user.getRoles().stream()
                .flatMap(role -> {
                    // Add role as authority (e.g., ROLE_BUYER)
                    var roleAuthority = java.util.stream.Stream.of(
                            new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase())
                    );
                    // Add permissions as authorities (e.g., PRODUCT_CREATE)
                    var permissionAuthorities = role.getPermissions().stream()
                            .map(Permission::getName)
                            .map(SimpleGrantedAuthority::new);
                    return java.util.stream.Stream.concat(roleAuthority, permissionAuthorities);
                })
                .collect(Collectors.toSet());
    }
}

