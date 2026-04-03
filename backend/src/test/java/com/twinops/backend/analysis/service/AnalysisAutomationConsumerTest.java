package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisReportDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalysisAutomationConsumerTest {

    @Mock
    private AnalysisService analysisService;

    private AnalysisAutomationConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new AnalysisAutomationConsumer(analysisService, "analysis.request");
    }

    @Test
    void shouldConsumeMessageAndCreateReportWithIdempotency() {
        when(analysisService.createReportWithIdempotency("DEV001", "cpu=90", "DEV001:2026040312"))
            .thenReturn(new AnalysisReportDto(1L, "DEV001", "cpu=90", "高风险", 0.9, "high", "检查冷却", "success", null, "2026-04-03 12:00:00"));

        consumer.onMessage("""
            {"deviceCode":"DEV001","metricSummary":"cpu=90","slot":"2026040312","idempotencyKey":"DEV001:2026040312"}
            """.trim());

        verify(analysisService).createReportWithIdempotency("DEV001", "cpu=90", "DEV001:2026040312");
    }

    @Test
    void shouldThrowWhenPayloadIsInvalid() {
        assertThrows(RuntimeException.class, () -> consumer.onMessage("not-json"));
    }
}

