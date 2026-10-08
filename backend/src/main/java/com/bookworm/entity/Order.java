package com.bookworm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @Column(nullable = false)
    private Integer subtotal;

    @Column(nullable = false)
    private Integer tax;

    @Column(nullable = false)
    @Builder.Default
    private Integer discount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer deliveryCharge = 0;

    @Column(nullable = false)
    private Integer totalAmount;

    /** "CONFIRMED" | "CANCELLED" | "DELIVERED" */
    @Column(nullable = false)
    @Builder.Default
    private String status = "CONFIRMED";

    @Column(nullable = false)
    private String paymentMethod;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime canCancelUntil;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
