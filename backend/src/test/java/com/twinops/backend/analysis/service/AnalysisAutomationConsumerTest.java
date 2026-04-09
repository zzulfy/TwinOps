package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisReportDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class AnalysisAutomationConsumerTest {

    @Mock
    private AnalysisService analysisService;
    @Mock
    private AnalysisAggregationService analysisAggregationService;

    private AnalysisAutomationConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new AnalysisAutomationConsumer(analysisService, analysisAggregationService, "analysis.request");
    }

    @Test
    void shouldConsumeMessageAndCreateReportWithIdempotency() {
        when(analysisService.createReportWithIdempotency("DEV001", "cpu=90", "DEV001:2026040312"))
            .thenReturn(new AnalysisReportDto(1L, "DEV001", "cpu=90", "高风险", 0.9, "high", "检查冷却", "success", null, "2026-04-03 12:00:00"));

        consumer.onMessage("""
            {"jobType":"analysis-single","deviceCode":"DEV001","metricSummary":"cpu=90","slot":"2026040312","idempotencyKey":"DEV001:2026040312","reportId":1}
            """.trim());

        verify(analysisService).createReportWithIdempotency("DEV001", "cpu=90", "DEV001:2026040312");
    }

    @Test
    void shouldConsumeBatchMessageAndRunAggregation() {
        consumer.onMessage("""
            {"jobType":"analysis-batch","deviceCode":"AGGREGATED","metricSummary":"batch","slot":"manual-2026040312","idempotencyKey":"batch:manual-2026040312","reportId":5}
            """.trim());

        verify(analysisAggregationService).processAggregatedBatch("manual-2026040312", "batch:manual-2026040312");
    }

    @Test
    void shouldConsumeBatchMessageWithoutDevicePayloadAndStillRunSingleAggregation() {
        consumer.onMessage("""
            {"jobType":"analysis-batch","deviceCode":"AGGREGATED","metricSummary":"auto-analysis slot=manual-2026040312","slot":"manual-2026040312","idempotencyKey":"batch:manual-2026040312","reportId":9}
            """.trim());

        verify(analysisAggregationService, times(1))
            .processAggregatedBatch("manual-2026040312", "batch:manual-2026040312");
    }

    @Test
    void shouldMarkReportFailedWhenBatchConsumptionFails() {
        doThrow(new RuntimeException("aggregate failed"))
            .when(analysisAggregationService).processAggregatedBatch("manual-2026040312", "batch:manual-2026040312");

        assertDoesNotThrow(() -> consumer.onMessage("""
            {"jobType":"analysis-batch","deviceCode":"AGGREGATED","metricSummary":"batch","slot":"manual-2026040312","idempotencyKey":"batch:manual-2026040312","reportId":5}
            """.trim()));

        verify(analysisService).failExistingProcessingReport(5L, "aggregate failed");
    }

    @Test
    void shouldNotThrowWhenPayloadIsInvalid() {
        assertDoesNotThrow(() -> consumer.onMessage("not-json"));
    }
}

