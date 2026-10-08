package com.bookworm.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

public class AuthDTOs {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class AuthResponse {
        private String id;
        private String name;
        private String email;
        private String role;
        private Integer giftPointsBalance;
        private String createdAt;
    }
}
