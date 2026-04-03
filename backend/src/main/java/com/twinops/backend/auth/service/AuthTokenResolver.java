package com.twinops.backend.auth.service;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
public class AuthTokenResolver {

    public String resolve(String authorizationHeader, String adminTokenHeader) {
        if (adminTokenHeader != null && !adminTokenHeader.isBlank()) {
            return adminTokenHeader.trim();
        }
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return "";
        }
        if (authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring("Bearer ".length()).trim();
        }
        if (authorizationHeader.startsWith(HttpHeaders.AUTHORIZATION)) {
            return "";
        }
        return authorizationHeader.trim();
    }

    public String maskToken(String token) {
        if (token == null || token.isBlank()) {
            return "n/a";
        }
        String trimmed = token.trim();
        return trimmed.length() <= 6 ? trimmed : trimmed.substring(trimmed.length() - 6);
    }
}
