package com.bookworm.service;

import com.bookworm.dto.ReviewDTOs;
import com.bookworm.entity.Book;
import com.bookworm.entity.Review;
import com.bookworm.entity.User;
import com.bookworm.repository.BookRepository;
import com.bookworm.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;

    public List<ReviewDTOs.ReviewResponse> getReviews(String bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTOs.ReviewResponse addReview(String bookId, ReviewDTOs.ReviewRequest req, User user) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new com.bookworm.exception.ResourceNotFoundException("Book not found: " + bookId));

        Review review = Review.builder()
                .book(book)
                .user(user)
                .userName(user.getName())
                .rating(req.getRating())
                .comment(req.getComment().trim())
                .build();

        reviewRepository.save(review);

        // Update aggregate rating on the book
        Double avg = reviewRepository.findAverageRatingByBookId(bookId);
        long count = reviewRepository.countByBookId(bookId);
        book.setRating(avg != null ? avg : req.getRating());
        book.setReviewCount((int) count);
        bookRepository.save(book);

        return toResponse(review);
    }

    private ReviewDTOs.ReviewResponse toResponse(Review r) {
        return ReviewDTOs.ReviewResponse.builder()
                .id(r.getId())
                .bookId(r.getBook().getId())
                .userId(r.getUser().getId())
                .userName(r.getUserName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .build();
    }
}
