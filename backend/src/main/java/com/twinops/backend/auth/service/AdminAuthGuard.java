package com.twinops.backend.auth.service;

import com.twinops.backend.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class AdminAuthGuard {

    private final AuthTokenResolver tokenResolver;
    private final AdminAuthService adminAuthService;

    public AdminAuthGuard(AuthTokenResolver tokenResolver, AdminAuthService adminAuthService) {
        this.tokenResolver = tokenResolver;
        this.adminAuthService = adminAuthService;
    }

    public void requireAdmin(HttpServletRequest request) {
        String token = tokenResolver.resolve(request.getHeader("Authorization"), request.getHeader("X-Admin-Token"));
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("admin login required");
        }
        adminAuthService.getIdentityByToken(token);
    }
}
