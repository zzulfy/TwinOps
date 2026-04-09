package com.twinops.backend.analysis.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.entity.AnalysisReportEntity;
import com.twinops.backend.analysis.mapper.AnalysisReportMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    @Mock
    private AnalysisReportMapper analysisReportMapper;

    @Mock
    private LlmProviderAdapter llmProviderAdapter;

    private AnalysisService analysisService;

    @BeforeEach
    void setUp() {
        analysisService = new AnalysisService(analysisReportMapper, llmProviderAdapter);
    }

    @Test
    void shouldSkipCreationWhenIdempotencyKeyExists() {
        AnalysisReportEntity existing = new AnalysisReportEntity();
        existing.setId(7L);
        existing.setDeviceCode("DEV007");
        existing.setMetricSummary("cpu=70");
        existing.setStatus("success");
        existing.setCreatedAt(LocalDateTime.of(2026, 4, 3, 12, 0));

        when(analysisReportMapper.selectOne(any(QueryWrapper.class))).thenReturn(existing);

        AnalysisReportDto result = analysisService.createReportWithIdempotency("DEV007", "cpu=70", "DEV007:2026040312");

        assertEquals(7L, result.id());
        assertEquals("DEV007", result.deviceCode());
        verifyNoInteractions(llmProviderAdapter);
        verify(analysisReportMapper, never()).insert(any(AnalysisReportEntity.class));
    }

    @Test
    void shouldCreateSuccessReportWhenNoIdempotentHit() throws Exception {
        when(analysisReportMapper.selectOne(any(QueryWrapper.class))).thenReturn(null);
        doAnswer(invocation -> {
            AnalysisReportEntity entity = invocation.getArgument(0);
            entity.setId(10L);
            entity.setCreatedAt(LocalDateTime.of(2026, 4, 3, 13, 0));
            return 1;
        }).when(analysisReportMapper).insert(any(AnalysisReportEntity.class));
        when(llmProviderAdapter.predict("DEV001", "cpu=90"))
            .thenReturn(new LlmPredictionResult("高风险过热", new BigDecimal("0.91"), "high", "检查冷却系统"));

        AnalysisReportDto result = analysisService.createReportWithIdempotency("DEV001", "cpu=90", "DEV001:2026040312");

        assertEquals(10L, result.id());
        assertEquals("success", result.status());
        assertEquals("high", result.riskLevel());
        assertEquals(0.91, result.confidence());
        assertNull(result.errorMessage());

        ArgumentCaptor<AnalysisReportEntity> updateCaptor = ArgumentCaptor.forClass(AnalysisReportEntity.class);
        verify(analysisReportMapper).updateById(updateCaptor.capture());
        assertEquals("success", updateCaptor.getValue().getStatus());
        assertEquals("DEV001:2026040312", updateCaptor.getValue().getIdempotencyKey());
    }

    @Test
    void shouldCreateProcessingReportForManualTrigger() {
        when(analysisReportMapper.selectOne(any(QueryWrapper.class))).thenReturn(null);
        doAnswer(invocation -> {
            AnalysisReportEntity entity = invocation.getArgument(0);
            entity.setId(15L);
            entity.setCreatedAt(LocalDateTime.of(2026, 4, 3, 15, 0));
            return 1;
        }).when(analysisReportMapper).insert(any(AnalysisReportEntity.class));

        AnalysisReportDto result = analysisService.createProcessingReport("DEV015", "cpu=88", "DEV015:manual");

        assertEquals(15L, result.id());
        assertEquals("processing", result.status());
        assertEquals("DEV015", result.deviceCode());
    }

    @Test
    void shouldPersistFailedStatusAfterRetriesExhausted() throws Exception {
        when(analysisReportMapper.selectOne(any(QueryWrapper.class))).thenReturn(null);
        doAnswer(invocation -> {
            AnalysisReportEntity entity = invocation.getArgument(0);
            entity.setId(11L);
            entity.setCreatedAt(LocalDateTime.of(2026, 4, 3, 14, 0));
            return 1;
        }).when(analysisReportMapper).insert(any(AnalysisReportEntity.class));
        when(llmProviderAdapter.predict("DEV009", "cpu=99"))
            .thenThrow(new RuntimeException("provider down"));

        AnalysisReportDto result = analysisService.createReportWithIdempotency("DEV009", "cpu=99", "DEV009:2026040312");

        assertEquals("failed", result.status());
        assertNotNull(result.errorMessage());
        assertTrue(result.errorMessage().contains("provider down"));

        ArgumentCaptor<AnalysisReportEntity> updateCaptor = ArgumentCaptor.forClass(AnalysisReportEntity.class);
        verify(analysisReportMapper).updateById(updateCaptor.capture());
        assertEquals("failed", updateCaptor.getValue().getStatus());
        assertTrue(updateCaptor.getValue().getErrorMessage().contains("provider down"));
    }

    @Test
    void shouldMarkStaleProcessingReportAsFailedWhenListing() {
        AnalysisReportEntity stale = new AnalysisReportEntity();
        stale.setId(18L);
        stale.setDeviceCode("AGGREGATED");
        stale.setMetricSummary("auto-analysis slot=manual-20260408123542");
        stale.setStatus("processing");
        stale.setCreatedAt(LocalDateTime.now(ZoneOffset.UTC).minusMinutes(30));
        stale.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC).minusMinutes(30));

        when(analysisReportMapper.selectList(any(QueryWrapper.class))).thenReturn(List.of(stale));

        List<AnalysisReportDto> result = analysisService.listReports(20);

        assertEquals(1, result.size());
        assertEquals("failed", result.get(0).status());
        assertTrue(result.get(0).errorMessage().contains("processing timeout"));
        verify(analysisReportMapper).updateById(stale);
    }

    @Test
    void shouldMarkStaleProcessingReportAsFailedWhenGettingDetail() {
        AnalysisReportEntity stale = new AnalysisReportEntity();
        stale.setId(19L);
        stale.setDeviceCode("AGGREGATED");
        stale.setMetricSummary("auto-analysis slot=manual-20260408124000");
        stale.setStatus("processing");
        stale.setCreatedAt(LocalDateTime.now(ZoneOffset.UTC).minusMinutes(20));
        stale.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC).minusMinutes(20));

        when(analysisReportMapper.selectById(19L)).thenReturn(stale);

        AnalysisReportDto detail = analysisService.getReport(19L);

        assertEquals("failed", detail.status());
        assertTrue(detail.errorMessage().contains("processing timeout"));
        verify(analysisReportMapper).updateById(stale);
    }

    @Test
    void shouldKeepRecentUtcProcessingReportAndFormatCreatedAtForShanghai() {
        Clock fixedClock = Clock.fixed(Instant.parse("2026-04-09T04:45:00Z"), ZoneOffset.UTC);
        analysisService = new AnalysisService(
            analysisReportMapper,
            llmProviderAdapter,
            "UTC",
            "Asia/Shanghai",
            fixedClock
        );

        AnalysisReportEntity recent = new AnalysisReportEntity();
        recent.setId(65L);
        recent.setDeviceCode("AGGREGATED");
        recent.setMetricSummary("auto-analysis slot=manual-20260409124447");
        recent.setStatus("processing");
        recent.setCreatedAt(LocalDateTime.of(2026, 4, 9, 4, 44, 47));
        recent.setUpdatedAt(LocalDateTime.of(2026, 4, 9, 4, 44, 47));

        when(analysisReportMapper.selectById(65L)).thenReturn(recent);

        AnalysisReportDto detail = analysisService.getReport(65L);

        assertEquals("processing", detail.status());
        assertEquals("2026-04-09 12:44:47", detail.createdAt());
        verify(analysisReportMapper, never()).updateById(any(AnalysisReportEntity.class));
    }
}

