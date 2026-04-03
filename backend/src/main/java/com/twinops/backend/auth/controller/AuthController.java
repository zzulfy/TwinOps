package com.twinops.backend.auth.controller;

import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.dto.AdminLoginRequest;
import com.twinops.backend.auth.dto.AdminLoginResponse;
import com.twinops.backend.auth.service.AdminAuthService;
import com.twinops.backend.auth.service.AuthTokenResolver;
import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.logging.LogFields;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AdminAuthService adminAuthService;
    private final AuthTokenResolver tokenResolver;

    public AuthController(AdminAuthService adminAuthService, AuthTokenResolver tokenResolver) {
        this.adminAuthService = adminAuthService;
        this.tokenResolver = tokenResolver;
    }

    @PostMapping("/login")
    public ApiResponse<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest body) {
        log.info("{}={} {}={} {}={} {}={} username={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "auth",
            LogFields.EVENT, "auth.login.request",
            LogFields.RESULT, "received",
            body.username()
        );
        return ApiResponse.ok(adminAuthService.login(body.username(), body.password()));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "auth",
            LogFields.EVENT, "auth.logout.request",
            LogFields.RESULT, "received"
        );
        adminAuthService.logout(tokenResolver.resolve(authorization, adminToken));
        return ApiResponse.ok(null);
    }

    @GetMapping("/me")
    public ApiResponse<AdminIdentityDto> me(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "auth",
            LogFields.EVENT, "auth.me.request",
            LogFields.RESULT, "received"
        );
        return ApiResponse.ok(adminAuthService.getIdentityByToken(tokenResolver.resolve(authorization, adminToken)));
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
