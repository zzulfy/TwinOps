package com.twinops.backend.analysis.controller;

import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.dto.AnalysisAutomationHealthDto;
import com.twinops.backend.analysis.dto.TriggerAnalysisResponse;
import com.twinops.backend.analysis.service.AnalysisAutomationHealthService;
import com.twinops.backend.analysis.service.AnalysisAutomationProducer;
import com.twinops.backend.analysis.service.AnalysisAutomationTriggerService;
import com.twinops.backend.analysis.service.AnalysisService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnalysisController.class)
class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalysisService analysisService;

    @MockBean
    private AnalysisAutomationProducer analysisAutomationProducer;

    @MockBean
    private AnalysisAutomationTriggerService analysisAutomationTriggerService;

    @MockBean
    private AnalysisAutomationHealthService analysisAutomationHealthService;

    @MockBean
    private com.twinops.backend.auth.service.AuthTokenResolver authTokenResolver;

    @MockBean
    private com.twinops.backend.auth.service.AdminAuthService adminAuthService;

    @Test
    void shouldCreateManualReportAfterAuthPasses() throws Exception {
        when(authTokenResolver.resolve(any(), any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(
            new com.twinops.backend.auth.dto.AdminIdentityDto("admin", "System Administrator", "admin")
        );
        when(analysisService.createProcessingReport(any(), any(), any())).thenReturn(
            new AnalysisReportDto(3L, "DEV001", "cpu=90", null, null, null, null, null, null, List.of(), List.of(), null, null, null, "processing", null, "2026-04-03 12:00:00", null)
        );
        mockMvc.perform(post("/api/analysis/reports")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"deviceCode":"DEV001","metricSummary":"cpu=90"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(3))
            .andExpect(jsonPath("$.data.status").value("processing"));
    }

    @Test
    void shouldReturnAcceptedTriggerResult() throws Exception {
        when(authTokenResolver.resolve(any(), any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(
            new com.twinops.backend.auth.dto.AdminIdentityDto("admin", "System Administrator", "admin")
        );
        when(analysisAutomationTriggerService.triggerManualBatch()).thenReturn(
            new TriggerAnalysisResponse("manual-20260403123000", 10L, "processing", 4, 4, 0)
        );

        mockMvc.perform(post("/api/analysis/reports/trigger")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.triggerId").value("manual-20260403123000"))
            .andExpect(jsonPath("$.data.reportId").value(10))
            .andExpect(jsonPath("$.data.targetCount").value(4))
            .andExpect(jsonPath("$.data.acceptedCount").value(4))
            .andExpect(jsonPath("$.data.failedCount").value(0))
            .andExpect(jsonPath("$.data.status").value("processing"));
        verify(analysisAutomationTriggerService, times(1)).triggerManualBatch();
    }

    @Test
    void shouldAcceptTriggerWithoutPayloadBody() throws Exception {
        when(authTokenResolver.resolve(any(), any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(
            new com.twinops.backend.auth.dto.AdminIdentityDto("admin", "System Administrator", "admin")
        );
        when(analysisAutomationTriggerService.triggerManualBatch()).thenReturn(
            new TriggerAnalysisResponse("manual-20260403123001", 11L, "processing", 2, 1, 0)
        );

        mockMvc.perform(post("/api/analysis/reports/trigger")
                .header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.triggerId").value("manual-20260403123001"))
            .andExpect(jsonPath("$.data.reportId").value(11))
            .andExpect(jsonPath("$.data.status").value("processing"));
        verify(analysisAutomationTriggerService, times(1)).triggerManualBatch();
    }

    @Test
    void shouldListReportsAfterAuthGuardPasses() throws Exception {
        when(authTokenResolver.resolve(any(), any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(
            new com.twinops.backend.auth.dto.AdminIdentityDto("admin", "System Administrator", "admin")
        );
        when(analysisService.listReports(5)).thenReturn(List.of(
            new AnalysisReportDto(1L, "DEV001", "cpu=90", "过热风险", 0.92, "high", "检查散热", "aerca_llm", "success", List.of(), List.of(), "model-v1", null, null, "success", null, "2026-04-03 12:00:00", null)
        ));

        mockMvc.perform(get("/api/analysis/reports").param("limit", "5").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].deviceCode").value("DEV001"));
    }

    @Test
    void shouldReturn401WhenListReportsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/analysis/reports"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("admin login required"));
    }

    @Test
    void shouldGetReportDetailAfterAuthGuardPasses() throws Exception {
        when(authTokenResolver.resolve(any(), any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(
            new com.twinops.backend.auth.dto.AdminIdentityDto("admin", "System Administrator", "admin")
        );
        when(analysisService.getReport(2L)).thenReturn(
            new AnalysisReportDto(2L, "DEV002", "cpu=80", "中风险", 0.61, "medium", "持续观察", "llm_only", "fallback", List.of(), List.of(), null, null, null, "success", null, "2026-04-03 00:00:00", null)
        );

        mockMvc.perform(get("/api/analysis/reports/2").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(2))
            .andExpect(jsonPath("$.data.deviceCode").value("DEV002"));
    }

    @Test
    void shouldReturnAutomationHealthAfterAuthGuardPasses() throws Exception {
        when(authTokenResolver.resolve(any(), any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(
            new com.twinops.backend.auth.dto.AdminIdentityDto("admin", "System Administrator", "admin")
        );
        when(analysisAutomationHealthService.getHealth()).thenReturn(
            new AnalysisAutomationHealthDto(
                "up",
                true,
                true,
                true,
                true,
                "analysis.request",
                "127.0.0.1:9092",
                "analysis automation consumer is running and kafka topic is reachable"
            )
        );

        mockMvc.perform(get("/api/analysis/health").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").value("up"))
            .andExpect(jsonPath("$.data.listenerRunning").value(true))
            .andExpect(jsonPath("$.data.kafkaReachable").value(true))
            .andExpect(jsonPath("$.data.topic").value("analysis.request"));
    }
}

