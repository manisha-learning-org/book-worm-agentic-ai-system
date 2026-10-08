package com.bookworm.controller;

import com.bookworm.dto.ApiResponse;
import com.bookworm.dto.CouponDTOs;
import com.bookworm.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    /** POST /api/coupons/validate */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponDTOs.CouponResponse>> validate(
            @Valid @RequestBody CouponDTOs.ValidateCouponRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(
                couponService.validate(req.getCode(), req.getSubtotal())));
    }
}
