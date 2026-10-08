package com.bookworm.controller;

import com.bookworm.dto.ApiResponse;
import com.bookworm.dto.AuthDTOs;
import com.bookworm.service.AuthService;
import com.bookworm.util.SessionHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SessionHelper sessionHelper;

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> register(
            @Valid @RequestBody AuthDTOs.RegisterRequest req,
            HttpServletRequest request) {

        AuthDTOs.AuthResponse user = authService.register(req);
        sessionHelper.createSession(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Account created", user));
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> login(
            @Valid @RequestBody AuthDTOs.LoginRequest req,
            HttpServletRequest request) {

        AuthDTOs.AuthResponse user = authService.login(req);
        sessionHelper.createSession(request, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Login successful", user));
    }

    /** POST /api/auth/logout */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        sessionHelper.invalidateSession(request);
        return ResponseEntity.ok(ApiResponse.ok("Logged out", null));
    }
}
