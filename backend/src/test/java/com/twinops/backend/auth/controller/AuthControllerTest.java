package com.twinops.backend.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.auth.config.AdminAuthInterceptor;
import com.twinops.backend.auth.config.WebMvcAuthConfig;
import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.dto.AdminLoginResponse;
import com.twinops.backend.common.exception.GlobalExceptionHandler;
import com.twinops.backend.auth.service.AdminAuthService;
import com.twinops.backend.auth.service.AuthTokenResolver;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({WebMvcAuthConfig.class, AdminAuthInterceptor.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminAuthService adminAuthService;

    @MockBean
    private AuthTokenResolver tokenResolver;

    @Test
    void shouldLoginSuccessfully() throws Exception {
        when(adminAuthService.login("admin", "admin123456")).thenReturn(
            new AdminLoginResponse("token", System.currentTimeMillis() + 1000, new AdminIdentityDto("admin", "System Administrator", "admin"))
        );

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(java.util.Map.of("username", "admin", "password", "admin123456"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.token").value("token"));
    }

    @Test
    void shouldReturnIdentityFromMe() throws Exception {
        when(tokenResolver.resolve(anyString(), org.mockito.ArgumentMatchers.isNull())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(new AdminIdentityDto("admin", "System Administrator", "admin"));

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.username").value("admin"));
    }

    @Test
    void shouldRejectMeWithoutToken() throws Exception {
        when(tokenResolver.resolve(org.mockito.ArgumentMatchers.isNull(), org.mockito.ArgumentMatchers.isNull())).thenReturn("");
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("admin login required"));
    }
}
