package com.bookworm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private Integer discountAmount;

    @Column(nullable = false)
    private Integer minOrderValue;

    @Builder.Default
    private String description = "";
}
