package com.bookworm.dto;

import lombok.*;
import jakarta.validation.constraints.*;

import java.util.List;

public class UserDTOs {

    @Data
    public static class UpdateProfileRequest {
        private String name;
        @Email(message = "Invalid email format")
        private String email;
    }

    @Data
    public static class AddressRequest {
        private String label = "Home";
        @NotBlank private String fullName;
        @NotBlank private String phone;
        @NotBlank private String line1;
        private String line2;
        @NotBlank private String city;
        @NotBlank private String state;
        @NotBlank private String pincode;
        private String country = "India";
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddressResponse {
        private String id;
        private String label;
        private String fullName;
        private String phone;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String pincode;
        private String country;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        private String role;
        private Integer giftPointsBalance;
        private String createdAt;
        private List<AddressResponse> addresses;
    }
}
