package com.twinops.backend.auth.dto;

public record AdminIdentityDto(
    String username,
    String displayName,
    String role
) {
}
