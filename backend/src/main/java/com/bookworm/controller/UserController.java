package com.bookworm.controller;

import com.bookworm.dto.ApiResponse;
import com.bookworm.dto.UserDTOs;
import com.bookworm.entity.User;
import com.bookworm.service.UserService;
import com.bookworm.util.SessionHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SessionHelper sessionHelper;

    /** GET /api/users/me */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTOs.UserResponse>> getProfile(HttpServletRequest request) {
        User user = sessionHelper.requireUser(request);
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(user.getId())));
    }

    /** PUT /api/users/me */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDTOs.UserResponse>> updateProfile(
            @Valid @RequestBody UserDTOs.UpdateProfileRequest req,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.ok(ApiResponse.ok(userService.updateProfile(user.getId(), req)));
    }

    /** GET /api/users/me/addresses */
    @GetMapping("/me/addresses")
    public ResponseEntity<ApiResponse<UserDTOs.UserResponse>> getAddresses(HttpServletRequest request) {
        User user = sessionHelper.requireUser(request);
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(user.getId())));
    }

    /** POST /api/users/me/addresses */
    @PostMapping("/me/addresses")
    public ResponseEntity<ApiResponse<UserDTOs.AddressResponse>> addAddress(
            @Valid @RequestBody UserDTOs.AddressRequest req,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(userService.addAddress(user.getId(), req)));
    }

    /** DELETE /api/users/me/addresses/{id} */
    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> removeAddress(
            @PathVariable String id,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        userService.removeAddress(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Address removed", null));
    }
}
