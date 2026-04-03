package com.twinops.backend.auth.dto;

public record AdminLoginResponse(
    String token,
    long expiresAt,
    AdminIdentityDto admin
) {
}
