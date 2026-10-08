package com.bookworm.controller;

import com.bookworm.dto.ApiResponse;
import com.bookworm.dto.WishlistDTOs;
import com.bookworm.entity.User;
import com.bookworm.service.WishlistService;
import com.bookworm.util.SessionHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final SessionHelper sessionHelper;

    /** GET /api/wishlist */
    @GetMapping
    public ResponseEntity<ApiResponse<WishlistDTOs.WishlistResponse>> getWishlist(
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.ok(ApiResponse.ok(wishlistService.getWishlist(user.getId())));
    }

    /** POST /api/wishlist */
    @PostMapping
    public ResponseEntity<ApiResponse<WishlistDTOs.WishlistItemResponse>> add(
            @Valid @RequestBody WishlistDTOs.AddToWishlistRequest req,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        wishlistService.addToWishlist(user.getId(), req.getBookId(), user)));
    }

    /** DELETE /api/wishlist/{bookId} */
    @DeleteMapping("/{bookId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable String bookId,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        wishlistService.removeFromWishlist(user.getId(), bookId);
        return ResponseEntity.ok(ApiResponse.ok("Removed from wishlist", null));
    }
}
