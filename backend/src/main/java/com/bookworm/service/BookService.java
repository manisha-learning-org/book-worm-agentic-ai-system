package com.bookworm.service;

import com.bookworm.dto.BookDTOs;
import com.bookworm.entity.Book;
import com.bookworm.exception.ResourceNotFoundException;
import com.bookworm.repository.BookRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    // ── List with filters ────────────────────────────────────────

    public BookDTOs.BookListResponse getBooks(String q, String category, String format,
                                               String lang, String price, String sort) {
        Specification<Book> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("author")), pattern),
                        cb.like(cb.lower(root.get("category")), pattern)
                ));
            }
            if (category != null && !category.isBlank() && !category.equals("All")) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (lang != null && !lang.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("language")), lang.toLowerCase()));
            }
            if (format != null && !format.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("format")), format.toLowerCase()));
            }
            if (price != null && !price.isBlank()) {
                switch (price) {
                    case "0-199"    -> predicates.add(cb.lessThanOrEqualTo(root.get("price"), 199));
                    case "200-499"  -> predicates.add(cb.between(root.get("price"), 200, 499));
                    case "500-999"  -> predicates.add(cb.between(root.get("price"), 500, 999));
                    case "1000+"    -> predicates.add(cb.greaterThanOrEqualTo(root.get("price"), 1000));
                }
            }

            // Apply sort order on the Criteria query
            if (sort != null) {
                switch (sort) {
                    case "price_asc"  -> query.orderBy(cb.asc(root.get("price")));
                    case "price_desc" -> query.orderBy(cb.desc(root.get("price")));
                    case "rating"     -> query.orderBy(cb.desc(root.get("rating")));
                    case "newest"     -> query.orderBy(cb.desc(root.get("publishedDate")));
                    default           -> query.orderBy(cb.desc(root.get("createdAt")));
                }
            } else {
                query.orderBy(cb.desc(root.get("createdAt")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Book> books = bookRepository.findAll(spec);
        return BookDTOs.BookListResponse.builder()
                .books(books.stream().map(this::toResponse).collect(Collectors.toList()))
                .total(books.size())
                .build();
    }

    // ── Single book ──────────────────────────────────────────────

    public BookDTOs.BookResponse getBook(String id) {
        return toResponse(findOrThrow(id));
    }

    // ── Related reads ────────────────────────────────────────────

    public List<BookDTOs.BookResponse> getRelated(String id, int limit) {
        Book book = findOrThrow(id);
        return bookRepository
                .findByCategoryAndIdNotOrderByRatingDesc(book.getCategory(), id)
                .stream()
                .limit(limit)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Landing sections ─────────────────────────────────────────

    public List<BookDTOs.BookResponse> getRecommended(int limit) {
        return bookRepository.findByIsRecommendedTrueOrderByRatingDesc()
                .stream().limit(limit).map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookDTOs.BookResponse> getBestsellers(int limit) {
        return bookRepository.findByIsBestsellerTrueOrderByCopiesSoldDesc()
                .stream().limit(limit).map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookDTOs.BookResponse> getNewLaunches(int limit) {
        return bookRepository.findByIsNewLaunchTrueOrderByPublishedDateDesc()
                .stream().limit(limit).map(this::toResponse).collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────

    public Book findOrThrow(String id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + id));
    }

    public BookDTOs.BookResponse toResponse(Book b) {
        return BookDTOs.BookResponse.builder()
                .id(b.getId())
                .title(b.getTitle())
                .author(b.getAuthor())
                .authorBio(b.getAuthorBio())
                .authorImage(b.getAuthorImage())
                .publisher(b.getPublisher())
                .format(b.getFormat())
                .category(b.getCategory())
                .price(b.getPrice())
                .originalPrice(b.getOriginalPrice())
                .rating(b.getRating())
                .reviewCount(b.getReviewCount())
                .copiesSold(b.getCopiesSold())
                .coverImage(b.getCoverImage())
                .tentativeDeliveryDays(b.getTentativeDeliveryDays())
                .isBestseller(b.getIsBestseller())
                .isNewLaunch(b.getIsNewLaunch())
                .isRecommended(b.getIsRecommended())
                .description(b.getDescription())
                .pages(b.getPages())
                .language(b.getLanguage())
                .isbn(b.getIsbn())
                .publishedDate(b.getPublishedDate())
                .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null)
                .build();
    }
}
