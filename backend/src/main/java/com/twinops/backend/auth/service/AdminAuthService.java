package com.twinops.backend.auth.service;

import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.dto.AdminLoginResponse;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.common.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);
    private static final Duration TOKEN_TTL = Duration.ofHours(12);

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, SessionState> sessions = new ConcurrentHashMap<>();
    private final String adminUsername;
    private final String adminPasswordHash;
    private final String adminDisplayName;

    public AdminAuthService(
        @Value("${twinops.auth.admin.username:admin}") String adminUsername,
        @Value("${twinops.auth.admin.password:admin123456}") String adminPassword,
        @Value("${twinops.auth.admin.display-name:System Administrator}") String adminDisplayName
    ) {
        this.adminUsername = adminUsername;
        this.adminPasswordHash = passwordEncoder.encode(adminPassword);
        this.adminDisplayName = adminDisplayName;
    }

    public AdminLoginResponse login(String username, String password) {
        if (!adminUsername.equals(username) || !passwordEncoder.matches(password, adminPasswordHash)) {
            log.warn("{}={} {}={} {}={} {}={} {}={} username={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "auth",
                LogFields.EVENT, "auth.login",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "AUTH_INVALID_CREDENTIALS",
                username
            );
            throw new UnauthorizedException("invalid admin credentials");
        }
        String token = issueToken();
        long expiresAt = System.currentTimeMillis() + TOKEN_TTL.toMillis();
        sessions.put(token, new SessionState(expiresAt));
        log.info("{}={} {}={} {}={} {}={} username={} token_suffix={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "auth",
            LogFields.EVENT, "auth.login",
            LogFields.RESULT, "success",
            username,
            maskedTokenSuffix(token)
        );
        return new AdminLoginResponse(token, expiresAt, identity());
    }

    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            sessions.remove(token);
            log.info("{}={} {}={} {}={} {}={} token_suffix={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "auth",
                LogFields.EVENT, "auth.logout",
                LogFields.RESULT, "success",
                maskedTokenSuffix(token)
            );
            return;
        }
        log.info("{}={} {}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "auth",
            LogFields.EVENT, "auth.logout",
            LogFields.RESULT, "noop",
            LogFields.ERROR_CODE, "AUTH_TOKEN_MISSING"
        );
    }

    public AdminIdentityDto getIdentityByToken(String token) {
        if (token == null || token.isBlank()) {
            log.warn("{}={} {}={} {}={} {}={} {}={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "auth",
                LogFields.EVENT, "auth.identity",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "AUTH_TOKEN_MISSING"
            );
            throw new UnauthorizedException("missing admin token");
        }
        SessionState state = sessions.get(token);
        if (state == null || state.expiresAt() <= System.currentTimeMillis()) {
            sessions.remove(token);
            log.warn("{}={} {}={} {}={} {}={} {}={} token_suffix={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "auth",
                LogFields.EVENT, "auth.identity",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "AUTH_SESSION_EXPIRED",
                maskedTokenSuffix(token)
            );
            throw new UnauthorizedException("admin session expired");
        }
        return identity();
    }

    private String issueToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private AdminIdentityDto identity() {
        return new AdminIdentityDto(adminUsername, adminDisplayName, "admin");
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }

    private String maskedTokenSuffix(String token) {
        if (token == null || token.isBlank()) {
            return "n/a";
        }
        int len = token.length();
        return len <= 6 ? token : token.substring(len - 6);
    }

    private record SessionState(long expiresAt) {
    }
}
