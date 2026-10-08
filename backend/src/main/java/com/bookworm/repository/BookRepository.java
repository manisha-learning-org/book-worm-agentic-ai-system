package com.bookworm.repository;

import com.bookworm.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String>,
        JpaSpecificationExecutor<Book> {

    List<Book> findByIsBestsellerTrueOrderByCopiesSoldDesc();

    List<Book> findByIsNewLaunchTrueOrderByPublishedDateDesc();

    List<Book> findByIsRecommendedTrueOrderByRatingDesc();

    List<Book> findByCategoryAndIdNotOrderByRatingDesc(String category, String id);
}
