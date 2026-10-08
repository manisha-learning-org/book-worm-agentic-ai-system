package com.bookworm.controller;

import com.bookworm.dto.ApiResponse;
import com.bookworm.dto.BookDTOs;
import com.bookworm.dto.ReviewDTOs;
import com.bookworm.entity.User;
import com.bookworm.service.BookService;
import com.bookworm.service.ReviewService;
import com.bookworm.util.SessionHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final ReviewService reviewService;
    private final SessionHelper sessionHelper;

    /** GET /api/books?q=&category=&format=&lang=&price=&sort= */
    @GetMapping
    public ResponseEntity<ApiResponse<BookDTOs.BookListResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String lang,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) String sort) {

        return ResponseEntity.ok(ApiResponse.ok(
                bookService.getBooks(q, category, format, lang, price, sort)));
    }

    /** GET /api/books/recommended */
    @GetMapping("/recommended")
    public ResponseEntity<ApiResponse<List<BookDTOs.BookResponse>>> recommended(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(bookService.getRecommended(limit)));
    }

    /** GET /api/books/bestsellers */
    @GetMapping("/bestsellers")
    public ResponseEntity<ApiResponse<List<BookDTOs.BookResponse>>> bestsellers(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(bookService.getBestsellers(limit)));
    }

    /** GET /api/books/new-launches */
    @GetMapping("/new-launches")
    public ResponseEntity<ApiResponse<List<BookDTOs.BookResponse>>> newLaunches(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(bookService.getNewLaunches(limit)));
    }

    /** GET /api/books/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDTOs.BookResponse>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(bookService.getBook(id)));
    }

    /** GET /api/books/{id}/related */
    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<BookDTOs.BookResponse>>> related(
            @PathVariable String id,
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(bookService.getRelated(id, limit)));
    }

    /** GET /api/books/{id}/reviews */
    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDTOs.ReviewResponse>>> getReviews(
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviews(id)));
    }

    /** POST /api/books/{id}/reviews  (requires auth) */
    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<ReviewDTOs.ReviewResponse>> addReview(
            @PathVariable String id,
            @Valid @RequestBody ReviewDTOs.ReviewRequest req,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(reviewService.addReview(id, req, user)));
    }
}
