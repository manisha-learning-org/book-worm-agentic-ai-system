package com.bookworm.service;

import com.bookworm.dto.CouponDTOs;
import com.bookworm.entity.Coupon;
import com.bookworm.exception.BadRequestException;
import com.bookworm.exception.ResourceNotFoundException;
import com.bookworm.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponDTOs.CouponResponse validate(String code, int subtotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code"));

        if (subtotal < coupon.getMinOrderValue()) {
            throw new BadRequestException(
                    "This coupon requires a minimum order value of ₹" + coupon.getMinOrderValue());
        }

        return CouponDTOs.CouponResponse.builder()
                .code(coupon.getCode())
                .discountAmount(coupon.getDiscountAmount())
                .minOrderValue(coupon.getMinOrderValue())
                .description(coupon.getDescription())
                .build();
    }
}
