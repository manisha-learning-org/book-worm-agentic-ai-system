package com.bookworm.dto;

import lombok.*;
import jakarta.validation.constraints.*;

import java.util.List;

public class WishlistDTOs {

    @Data
    public static class AddToWishlistRequest {
        @NotBlank(message = "bookId is required")
        private String bookId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WishlistItemResponse {
        private String id;
        private String bookId;
        private BookDTOs.BookResponse book;
        private String createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WishlistResponse {
        private List<WishlistItemResponse> items;
        private int count;
    }
}
