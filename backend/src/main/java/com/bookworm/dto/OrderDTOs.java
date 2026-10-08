package com.bookworm.dto;

import lombok.*;
import jakarta.validation.constraints.*;

import java.util.List;

public class OrderDTOs {

    @Data
    public static class OrderItemRequest {
        @NotBlank private String bookId;
        @NotNull @Min(1) private Integer quantity;
        @NotBlank private String selectedFormat;
        @NotNull @Min(0) private Integer priceAtAdd;
    }

    @Data
    public static class AddressRequest {
        private String label = "Delivery";
        @NotBlank private String fullName;
        @NotBlank private String phone;
        @NotBlank private String line1;
        private String line2;
        @NotBlank private String city;
        @NotBlank private String state;
        @NotBlank private String pincode;
        private String country = "India";
    }

    @Data
    public static class PlaceOrderRequest {
        @NotEmpty private List<OrderItemRequest> items;
        @NotNull private AddressRequest address;
        @NotBlank private String paymentMethod;
        private String couponCode;
        private Boolean useGiftPoints;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private String id;
        private String bookId;
        private String bookTitle;
        private String bookAuthor;
        private String bookCoverImage;
        private Integer quantity;
        private String selectedFormat;
        private Integer priceAtAdd;
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
    public static class OrderResponse {
        private String id;
        private String userId;
        private AddressResponse address;
        private List<OrderItemResponse> items;
        private Integer subtotal;
        private Integer tax;
        private Integer discount;
        private Integer deliveryCharge;
        private Integer totalAmount;
        private String status;
        private String paymentMethod;
        private String createdAt;
        private String canCancelUntil;
    }
}
