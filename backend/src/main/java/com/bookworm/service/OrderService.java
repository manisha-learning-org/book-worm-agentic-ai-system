package com.bookworm.service;

import com.bookworm.dto.OrderDTOs;
import com.bookworm.entity.*;
import com.bookworm.exception.BadRequestException;
import com.bookworm.exception.ResourceNotFoundException;
import com.bookworm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    private static final int TAX_RATE_PCT   = 5;     // 5% GST
    private static final int FREE_DELIVERY  = 499;   // free above ₹499
    private static final int DELIVERY_FEE   = 49;
    private static final int GIFT_PT_VALUE  = 1;     // 1 pt = ₹1

    @Transactional
    public OrderDTOs.OrderResponse placeOrder(OrderDTOs.PlaceOrderRequest req, User user) {

        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new BadRequestException("Order must have at least one item");
        }

        // ── Validate books ──────────────────────────────────────
        for (OrderDTOs.OrderItemRequest item : req.getItems()) {
            bookRepository.findById(item.getBookId())
                    .orElseThrow(() -> new BadRequestException("Book not found: " + item.getBookId()));
        }

        // ── Calculate totals ────────────────────────────────────
        int subtotal = req.getItems().stream()
                .mapToInt(i -> i.getPriceAtAdd() * i.getQuantity())
                .sum();
        int tax = Math.round(subtotal * TAX_RATE_PCT / 100f);
        int deliveryCharge = subtotal >= FREE_DELIVERY ? 0 : DELIVERY_FEE;

        // Coupon
        int couponDiscount = 0;
        if (req.getCouponCode() != null && !req.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCode(req.getCouponCode().toUpperCase()).orElse(null);
            if (coupon != null && subtotal >= coupon.getMinOrderValue()) {
                couponDiscount = coupon.getDiscountAmount();
            }
        }

        // Gift points
        int giftDiscount = 0;
        if (Boolean.TRUE.equals(req.getUseGiftPoints()) && user.getGiftPointsBalance() > 0) {
            int maxGift = user.getGiftPointsBalance() * GIFT_PT_VALUE;
            giftDiscount = Math.min(maxGift, subtotal + tax + deliveryCharge - couponDiscount);
            int pointsUsed = (int) Math.ceil((double) giftDiscount / GIFT_PT_VALUE);
            user.setGiftPointsBalance(user.getGiftPointsBalance() - pointsUsed);
            userRepository.save(user);
        }

        int totalDiscount = couponDiscount + giftDiscount;
        int totalAmount = Math.max(0, subtotal + tax + deliveryCharge - totalDiscount);
        LocalDateTime canCancelUntil = LocalDateTime.now().plusHours(48);

        // ── Persist delivery address ────────────────────────────
        OrderDTOs.AddressRequest addrReq = req.getAddress();
        Address address = Address.builder()
                .label(addrReq.getLabel() != null ? addrReq.getLabel() : "Delivery")
                .fullName(addrReq.getFullName())
                .phone(addrReq.getPhone() != null ? addrReq.getPhone() : "")
                .line1(addrReq.getLine1())
                .line2(addrReq.getLine2())
                .city(addrReq.getCity())
                .state(addrReq.getState() != null ? addrReq.getState() : "")
                .pincode(addrReq.getPincode() != null ? addrReq.getPincode() : "")
                .country(addrReq.getCountry() != null ? addrReq.getCountry() : "India")
                .user(user)
                .build();
        addressRepository.save(address);

        // ── Persist order ───────────────────────────────────────
        Order order = Order.builder()
                .user(user)
                .address(address)
                .subtotal(subtotal)
                .tax(tax)
                .discount(totalDiscount)
                .deliveryCharge(deliveryCharge)
                .totalAmount(totalAmount)
                .paymentMethod(req.getPaymentMethod())
                .canCancelUntil(canCancelUntil)
                .build();

        List<OrderItem> items = req.getItems().stream().map(i -> {
            Book book = bookRepository.findById(i.getBookId()).orElseThrow();
            return OrderItem.builder()
                    .order(order)
                    .book(book)
                    .quantity(i.getQuantity())
                    .selectedFormat(i.getSelectedFormat())
                    .priceAtAdd(i.getPriceAtAdd())
                    .build();
        }).collect(Collectors.toList());

        order.setItems(items);
        orderRepository.save(order);

        return toResponse(order);
    }

    public List<OrderDTOs.OrderResponse> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderDTOs.OrderResponse getOrder(String orderId, String userId) {
        return toResponse(orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    @Transactional
    public OrderDTOs.OrderResponse cancelOrder(String orderId, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!"CONFIRMED".equals(order.getStatus())) {
            throw new BadRequestException("Order cannot be cancelled (status: " + order.getStatus() + ")");
        }
        if (LocalDateTime.now().isAfter(order.getCanCancelUntil())) {
            throw new BadRequestException("Cancellation window has expired");
        }

        // Refund gift points if gift payment was used
        if ("Gift Points".equals(order.getPaymentMethod())) {
            User user = order.getUser();
            user.setGiftPointsBalance(user.getGiftPointsBalance() + order.getDiscount());
            userRepository.save(user);
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);
        return toResponse(order);
    }

    // ── Mapper ───────────────────────────────────────────────────

    private OrderDTOs.OrderResponse toResponse(Order o) {
        OrderDTOs.AddressResponse addr = OrderDTOs.AddressResponse.builder()
                .id(o.getAddress().getId())
                .label(o.getAddress().getLabel())
                .fullName(o.getAddress().getFullName())
                .phone(o.getAddress().getPhone())
                .line1(o.getAddress().getLine1())
                .line2(o.getAddress().getLine2())
                .city(o.getAddress().getCity())
                .state(o.getAddress().getState())
                .pincode(o.getAddress().getPincode())
                .country(o.getAddress().getCountry())
                .build();

        List<OrderDTOs.OrderItemResponse> items = o.getItems().stream().map(i ->
                OrderDTOs.OrderItemResponse.builder()
                        .id(i.getId())
                        .bookId(i.getBook().getId())
                        .bookTitle(i.getBook().getTitle())
                        .bookAuthor(i.getBook().getAuthor())
                        .bookCoverImage(i.getBook().getCoverImage())
                        .quantity(i.getQuantity())
                        .selectedFormat(i.getSelectedFormat())
                        .priceAtAdd(i.getPriceAtAdd())
                        .build()
        ).collect(Collectors.toList());

        return OrderDTOs.OrderResponse.builder()
                .id(o.getId())
                .userId(o.getUser().getId())
                .address(addr)
                .items(items)
                .subtotal(o.getSubtotal())
                .tax(o.getTax())
                .discount(o.getDiscount())
                .deliveryCharge(o.getDeliveryCharge())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .paymentMethod(o.getPaymentMethod())
                .createdAt(o.getCreatedAt() != null ? o.getCreatedAt().toString() : null)
                .canCancelUntil(o.getCanCancelUntil() != null ? o.getCanCancelUntil().toString() : null)
                .build();
    }
}
