package com.bookworm.service;

import com.bookworm.dto.BookDTOs;
import com.bookworm.dto.WishlistDTOs;
import com.bookworm.entity.Book;
import com.bookworm.entity.User;
import com.bookworm.entity.WishlistItem;
import com.bookworm.exception.ResourceNotFoundException;
import com.bookworm.repository.BookRepository;
import com.bookworm.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;

    public WishlistDTOs.WishlistResponse getWishlist(String userId) {
        List<WishlistDTOs.WishlistItemResponse> items = wishlistRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return WishlistDTOs.WishlistResponse.builder()
                .items(items).count(items.size()).build();
    }

    @Transactional
    public WishlistDTOs.WishlistItemResponse addToWishlist(String userId, String bookId, User user) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));

        WishlistItem item = wishlistRepository.findByUserIdAndBookId(userId, bookId)
                .orElseGet(() -> wishlistRepository.save(
                        WishlistItem.builder().user(user).book(book).build()
                ));

        return toResponse(item);
    }

    @Transactional
    public void removeFromWishlist(String userId, String bookId) {
        wishlistRepository.deleteByUserIdAndBookId(userId, bookId);
    }

    private WishlistDTOs.WishlistItemResponse toResponse(WishlistItem w) {
        BookDTOs.BookResponse book = bookService.toResponse(w.getBook());
        return WishlistDTOs.WishlistItemResponse.builder()
                .id(w.getId())
                .bookId(w.getBook().getId())
                .book(book)
                .createdAt(w.getCreatedAt() != null ? w.getCreatedAt().toString() : null)
                .build();
    }
}
