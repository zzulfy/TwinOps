package com.twinops.backend.telemetry.controller;

import com.twinops.backend.common.dto.TelemetryPointDto;
import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.service.AdminAuthService;
import com.twinops.backend.auth.service.AuthTokenResolver;
import com.twinops.backend.telemetry.service.TelemetryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TelemetryController.class)
class TelemetryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TelemetryService telemetryService;

    @MockBean
    private AuthTokenResolver authTokenResolver;

    @MockBean
    private AdminAuthService adminAuthService;

    @Test
    void shouldQueryTelemetryByDeviceAndLimit() throws Exception {
        when(authTokenResolver.resolve(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(new AdminIdentityDto("admin", "System Administrator", "admin"));
        List<TelemetryPointDto> points = List.of(
            new TelemetryPointDto(
                "03-30 10:00",
                new BigDecimal("25.0"),
                new BigDecimal("50.0"),
                new BigDecimal("220.0"),
                new BigDecimal("7.0"),
                new BigDecimal("1400.0"),
                new BigDecimal("40.0"),
                new BigDecimal("55.0"),
                new BigDecimal("48.0"),
                new BigDecimal("188.0")
            )
        );

        when(telemetryService.query("DEV001", null, null, 2)).thenReturn(points);

        mockMvc.perform(get("/api/telemetry").param("deviceCode", "DEV001").param("limit", "2").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].time").value("03-30 10:00"));
    }

    @Test
    void shouldRunRetentionCleanup() throws Exception {
        when(authTokenResolver.resolve(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(new AdminIdentityDto("admin", "System Administrator", "admin"));
        when(telemetryService.deleteOlderThan30Days()).thenReturn(123);

        mockMvc.perform(get("/api/telemetry/retention/cleanup").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").value(123));
    }
}
