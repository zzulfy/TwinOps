package com.twinops.backend.auth.config;

import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.service.AdminAuthService;
import com.twinops.backend.auth.service.AuthTokenResolver;
import com.twinops.backend.common.logging.LogFields;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthInterceptor.class);
    private static final String UNAUTHORIZED_BODY = "{\"success\":false,\"message\":\"admin login required\",\"data\":null}";
    public static final String ADMIN_IDENTITY_ATTR = "adminIdentity";

    private final AuthTokenResolver tokenResolver;
    private final AdminAuthService adminAuthService;

    public AdminAuthInterceptor(AuthTokenResolver tokenResolver, AdminAuthService adminAuthService) {
        this.tokenResolver = tokenResolver;
        this.adminAuthService = adminAuthService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        String token = tokenResolver.resolve(
            request.getHeader(HttpHeaders.AUTHORIZATION),
            request.getHeader("X-Admin-Token")
        );
        if (token == null || token.isBlank()) {
            reject(response, request.getRequestURI(), "AUTH_TOKEN_MISSING");
            return false;
        }
        AdminIdentityDto identity = adminAuthService.getIdentityByToken(token);
        request.setAttribute(ADMIN_IDENTITY_ATTR, identity);
        return true;
    }

    private void reject(HttpServletResponse response, String path, String code) throws Exception {
        log.warn("{}={} {}={} {}={} {}={} {}={} path={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "auth",
            LogFields.EVENT, "auth.interceptor",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, code,
            path
        );
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(UNAUTHORIZED_BODY);
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
