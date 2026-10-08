package com.bookworm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String authorBio = "";

    @Builder.Default
    private String authorImage = "";

    @Column(nullable = false)
    private String publisher;

    /** "Paperback" | "Hardcover" | "eBook" */
    @Column(nullable = false)
    @Builder.Default
    private String format = "Paperback";

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Integer price;

    private Integer originalPrice;

    @Column(nullable = false)
    @Builder.Default
    private Double rating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer copiesSold = 0;

    @Builder.Default
    private String coverImage = "";

    @Column(nullable = false)
    @Builder.Default
    private String tentativeDeliveryDays = "3-5 days";

    @Column(nullable = false)
    @Builder.Default
    private Boolean isBestseller = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isNewLaunch = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRecommended = false;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private Integer pages;

    @Builder.Default
    private String language = "English";

    @Column(unique = true)
    private String isbn;

    private String publishedDate;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WishlistItem> wishlistItems = new ArrayList<>();
}
