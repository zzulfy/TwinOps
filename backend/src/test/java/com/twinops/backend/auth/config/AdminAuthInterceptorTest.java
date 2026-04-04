package com.twinops.backend.auth.config;

import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.service.AdminAuthService;
import com.twinops.backend.auth.service.AuthTokenResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAuthInterceptorTest {

    @Mock
    private AuthTokenResolver tokenResolver;

    @Mock
    private AdminAuthService adminAuthService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    private AdminAuthInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new AdminAuthInterceptor(tokenResolver, adminAuthService);
    }

    @Test
    void shouldRejectWhenTokenMissing() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getHeader("X-Admin-Token")).thenReturn(null);
        when(tokenResolver.resolve(null, null)).thenReturn("");
        when(request.getRequestURI()).thenReturn("/api/devices");
        when(response.getWriter()).thenReturn(new PrintWriter(new java.io.StringWriter()));

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertFalse(allowed);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    void shouldAllowWhenTokenValidAndSetIdentityAttribute() throws Exception {
        AdminIdentityDto identity = new AdminIdentityDto("admin", "System Administrator", "admin");
        when(request.getHeader("Authorization")).thenReturn("Bearer token");
        when(request.getHeader("X-Admin-Token")).thenReturn(null);
        when(tokenResolver.resolve(anyString(), org.mockito.ArgumentMatchers.isNull())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(identity);

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed);
        verify(request).setAttribute(AdminAuthInterceptor.ADMIN_IDENTITY_ATTR, identity);
    }
}
