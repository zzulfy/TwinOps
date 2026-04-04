package com.twinops.backend.dashboard.controller;

import com.twinops.backend.auth.config.AdminAuthInterceptor;
import com.twinops.backend.auth.config.WebMvcAuthConfig;
import com.twinops.backend.common.dto.AlarmItemDto;
import com.twinops.backend.common.dto.ChartSeriesDto;
import com.twinops.backend.common.dto.DashboardSummaryDto;
import com.twinops.backend.common.dto.DeviceScaleItemDto;
import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.service.AdminAuthService;
import com.twinops.backend.auth.service.AuthTokenResolver;
import com.twinops.backend.common.exception.GlobalExceptionHandler;
import com.twinops.backend.dashboard.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import({WebMvcAuthConfig.class, AdminAuthInterceptor.class, GlobalExceptionHandler.class})
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private AuthTokenResolver authTokenResolver;

    @MockBean
    private AdminAuthService adminAuthService;

    @Test
    void shouldReturnDashboardSummary() throws Exception {
        when(authTokenResolver.resolve(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(new AdminIdentityDto("admin", "System Administrator", "admin"));
        DashboardSummaryDto summary = new DashboardSummaryDto(
            List.of(new DeviceScaleItemDto("fa-solid fa-server", "服务器机柜", "15", "个")),
            List.of(new AlarmItemDto(1L, "1# 服务器机柜", "温度过高", 2, "08:21", "new")),
            new ChartSeriesDto(List.of("10:00", "10:05"), List.of(12.5, 14.0)),
            new ChartSeriesDto(List.of("10:00", "10:05"), List.of(45.0, 49.5))
        );

        when(dashboardService.summary()).thenReturn(summary);

        mockMvc.perform(get("/api/dashboard/summary").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.deviceScale.length()").value(1))
            .andExpect(jsonPath("$.data.alarms.length()").value(1))
            .andExpect(jsonPath("$.data.faultRate.labels.length()").value(2));
    }

    @Test
    void shouldRejectDashboardSummaryWithoutToken() throws Exception {
        when(authTokenResolver.resolve(org.mockito.ArgumentMatchers.isNull(), org.mockito.ArgumentMatchers.isNull())).thenReturn("");

        mockMvc.perform(get("/api/dashboard/summary"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("admin login required"));
    }
}
