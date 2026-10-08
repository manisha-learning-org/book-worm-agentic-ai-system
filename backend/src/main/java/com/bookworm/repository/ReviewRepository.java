package com.bookworm.repository;

import com.bookworm.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findByBookIdOrderByCreatedAtDesc(String bookId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = :bookId")
    Double findAverageRatingByBookId(@Param("bookId") String bookId);

    long countByBookId(String bookId);
}
