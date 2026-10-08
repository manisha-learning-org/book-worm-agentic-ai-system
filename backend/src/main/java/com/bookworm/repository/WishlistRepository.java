package com.bookworm.repository;

import com.bookworm.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, String> {

    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<WishlistItem> findByUserIdAndBookId(String userId, String bookId);

    boolean existsByUserIdAndBookId(String userId, String bookId);

    void deleteByUserIdAndBookId(String userId, String bookId);
}
