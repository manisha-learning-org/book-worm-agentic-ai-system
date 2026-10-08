package com.bookworm.dto;

import lombok.*;
import jakarta.validation.constraints.*;

import java.util.List;

public class BookDTOs {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BookResponse {
        private String id;
        private String title;
        private String author;
        private String authorBio;
        private String authorImage;
        private String publisher;
        private String format;
        private String category;
        private Integer price;
        private Integer originalPrice;
        private Double rating;
        private Integer reviewCount;
        private Integer copiesSold;
        private String coverImage;
        private String tentativeDeliveryDays;
        private Boolean isBestseller;
        private Boolean isNewLaunch;
        private Boolean isRecommended;
        private String description;
        private Integer pages;
        private String language;
        private String isbn;
        private String publishedDate;
        private String createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BookListResponse {
        private List<BookResponse> books;
        private long total;
    }
}
