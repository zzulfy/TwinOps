package com.twinops.backend.analysis.service;

import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class AnalysisAggregationServiceTest {

    @Mock
    private DeviceMapper deviceMapper;
    @Mock
    private TelemetryMapper telemetryMapper;
    @Mock
    private AnalysisService analysisService;

    private AnalysisAggregationService aggregationService;

    @BeforeEach
    void setUp() {
        aggregationService = new AnalysisAggregationService(deviceMapper, telemetryMapper, analysisService);
    }

    @Test
    void shouldBuildAggregatedSummaryAndRunSingleAnalysis() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(
            device("DEV001", "warning", "A1"),
            device("DEV002", "error", "B2")
        ));
        when(telemetryMapper.selectOne(any()))
            .thenReturn(metric("91.2", "70.3"))
            .thenReturn(metric("99.1", "88.8"));

        aggregationService.processAggregatedBatch("manual-2026040312", "batch:manual-2026040312");

        ArgumentCaptor<String> summaryCaptor = ArgumentCaptor.forClass(String.class);
        verify(analysisService).createReportWithIdempotency(eq("AGGREGATED"), summaryCaptor.capture(), eq("batch:manual-2026040312"));
        String summary = summaryCaptor.getValue();
        assertTrue(summary.contains("mode=aggregated"));
        assertTrue(summary.contains("deviceCode=DEV001"));
        assertTrue(summary.contains("deviceCode=DEV002"));
        assertTrue(summary.contains("cpuLoad=70.3"));
        assertTrue(summary.contains("temperature=99.1"));
        verify(deviceMapper, times(1)).selectList(any());
        verify(telemetryMapper, times(2)).selectOne(any());
    }

    @Test
    void shouldThrowWhenNoTargetDevicesForAggregatedBatch() {
        when(deviceMapper.selectList(any())).thenReturn(List.of());

        assertThrows(RuntimeException.class, () ->
            aggregationService.processAggregatedBatch("manual-2026040312", "batch:manual-2026040312")
        );
    }

    private static DeviceEntity device(String code, String status, String location) {
        DeviceEntity entity = new DeviceEntity();
        entity.setDeviceCode(code);
        entity.setStatus(status);
        entity.setLocation(location);
        return entity;
    }

    private static TelemetryEntity metric(String temperature, String cpuLoad) {
        TelemetryEntity telemetry = new TelemetryEntity();
        telemetry.setTemperature(new BigDecimal(temperature));
        telemetry.setCpuLoad(new BigDecimal(cpuLoad));
        return telemetry;
    }
}
