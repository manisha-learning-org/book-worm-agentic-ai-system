package com.bookworm.controller;

import com.bookworm.dto.ApiResponse;
import com.bookworm.dto.OrderDTOs;
import com.bookworm.entity.User;
import com.bookworm.service.OrderService;
import com.bookworm.util.SessionHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final SessionHelper sessionHelper;

    /** POST /api/orders */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTOs.OrderResponse>> placeOrder(
            @Valid @RequestBody OrderDTOs.PlaceOrderRequest req,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully",
                        orderService.placeOrder(req, user)));
    }

    /** GET /api/orders */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDTOs.OrderResponse>>> getOrders(
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.ok(ApiResponse.ok(orderService.getUserOrders(user.getId())));
    }

    /** GET /api/orders/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTOs.OrderResponse>> getOrder(
            @PathVariable String id,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrder(id, user.getId())));
    }

    /** PATCH /api/orders/{id}/cancel */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDTOs.OrderResponse>> cancelOrder(
            @PathVariable String id,
            HttpServletRequest request) {

        User user = sessionHelper.requireUser(request);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled",
                orderService.cancelOrder(id, user.getId())));
    }
}
