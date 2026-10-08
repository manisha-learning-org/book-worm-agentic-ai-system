package com.bookworm.service;

import com.bookworm.dto.UserDTOs;
import com.bookworm.entity.Address;
import com.bookworm.entity.User;
import com.bookworm.exception.ConflictException;
import com.bookworm.exception.ResourceNotFoundException;
import com.bookworm.repository.AddressRepository;
import com.bookworm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserDTOs.UserResponse getProfile(String userId) {
        return toUserResponse(findOrThrow(userId));
    }

    @Transactional
    public UserDTOs.UserResponse updateProfile(String userId, UserDTOs.UpdateProfileRequest req) {
        User user = findOrThrow(userId);

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName().trim());
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String newEmail = req.getEmail().trim().toLowerCase();
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new ConflictException("Email is already taken by another account");
            }
            user.setEmail(newEmail);
        }

        userRepository.save(user);
        return toUserResponse(user);
    }

    @Transactional
    public UserDTOs.AddressResponse addAddress(String userId, UserDTOs.AddressRequest req) {
        User user = findOrThrow(userId);

        Address address = Address.builder()
                .label(req.getLabel())
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .line1(req.getLine1())
                .line2(req.getLine2())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .country(req.getCountry())
                .user(user)
                .build();

        addressRepository.save(address);
        return toAddressResponse(address);
    }

    @Transactional
    public void removeAddress(String userId, String addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address not found");
        }
        addressRepository.delete(address);
    }

    // ── Helpers ──────────────────────────────────────────────────

    public User findOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDTOs.UserResponse toUserResponse(User user) {
        List<UserDTOs.AddressResponse> addresses = addressRepository
                .findByUserId(user.getId())
                .stream()
                .map(this::toAddressResponse)
                .collect(Collectors.toList());

        return UserDTOs.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .giftPointsBalance(user.getGiftPointsBalance())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .addresses(addresses)
                .build();
    }

    public UserDTOs.AddressResponse toAddressResponse(Address a) {
        return UserDTOs.AddressResponse.builder()
                .id(a.getId()).label(a.getLabel())
                .fullName(a.getFullName()).phone(a.getPhone())
                .line1(a.getLine1()).line2(a.getLine2())
                .city(a.getCity()).state(a.getState())
                .pincode(a.getPincode()).country(a.getCountry())
                .build();
    }
}
