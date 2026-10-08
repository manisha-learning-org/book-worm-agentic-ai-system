package com.bookworm.service;

import com.bookworm.dto.AuthDTOs;
import com.bookworm.entity.User;
import com.bookworm.exception.BadRequestException;
import com.bookworm.exception.ConflictException;
import com.bookworm.exception.UnauthorizedException;
import com.bookworm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().toLowerCase())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .name(req.getName().trim())
                .email(req.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role("REGISTERED")
                .giftPointsBalance(500)
                .build();

        userRepository.save(user);
        return toAuthResponse(user);
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // For the demo, allow any password if hash is blank (seeded users have no hash)
        if (!user.getPasswordHash().isBlank() &&
                !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return toAuthResponse(user);
    }

    public AuthDTOs.AuthResponse toAuthResponse(User user) {
        return AuthDTOs.AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .giftPointsBalance(user.getGiftPointsBalance())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
