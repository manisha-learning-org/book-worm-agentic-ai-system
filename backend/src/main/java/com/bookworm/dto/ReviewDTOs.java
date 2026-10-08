package com.bookworm.dto;

import lombok.*;
import jakarta.validation.constraints.*;

public class ReviewDTOs {

    @Data
    public static class ReviewRequest {
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        private Integer rating;

        @NotBlank(message = "Comment is required")
        private String comment;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReviewResponse {
        private String id;
        private String bookId;
        private String userId;
        private String userName;
        private Integer rating;
        private String comment;
        private String createdAt;
    }
}
