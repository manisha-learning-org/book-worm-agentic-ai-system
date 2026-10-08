package com.bookworm.dto;

import lombok.*;
import jakarta.validation.constraints.*;

public class CouponDTOs {

    @Data
    public static class ValidateCouponRequest {
        @NotBlank(message = "Coupon code is required")
        private String code;

        @NotNull(message = "Subtotal is required")
        @Min(value = 0, message = "Subtotal must be non-negative")
        private Integer subtotal;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CouponResponse {
        private String code;
        private Integer discountAmount;
        private Integer minOrderValue;
        private String description;
    }
}
