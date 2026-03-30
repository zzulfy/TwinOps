package com.twinops.backend.telemetry.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.common.dto.TelemetryPointDto;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TelemetryServiceTest {

    @Mock
    private TelemetryMapper telemetryMapper;

    private TelemetryService telemetryService;

    @BeforeEach
    void setUp() {
        telemetryService = new TelemetryService(telemetryMapper);
    }

    @Test
    void shouldMapQueryResultWithFormattedTimeAndAllMetrics() {
        TelemetryEntity entity = new TelemetryEntity();
        entity.setMetricTime(LocalDateTime.of(2026, 3, 30, 10, 5));
        entity.setTemperature(new BigDecimal("25.0"));
        entity.setHumidity(new BigDecimal("50.0"));
        entity.setVoltage(new BigDecimal("220.0"));
        entity.setCurrent(new BigDecimal("7.0"));
        entity.setPower(new BigDecimal("1400.0"));
        entity.setCpuLoad(new BigDecimal("40.0"));
        entity.setMemoryUsage(new BigDecimal("55.0"));
        entity.setDiskUsage(new BigDecimal("48.0"));
        entity.setNetworkTraffic(new BigDecimal("188.0"));

        when(telemetryMapper.selectList(any())).thenReturn(List.of(entity));

        List<TelemetryPointDto> result = telemetryService.query("DEV001", null, null, 120);

        assertEquals(1, result.size());
        TelemetryPointDto point = result.get(0);
        assertEquals("03-30 10:05", point.time());
        assertEquals(new BigDecimal("25.0"), point.temperature());
        assertEquals(new BigDecimal("188.0"), point.networkTraffic());
    }

    @Test
    void shouldFallbackToDashWhenMetricTimeMissing() {
        TelemetryEntity entity = new TelemetryEntity();
        entity.setMetricTime(null);

        when(telemetryMapper.selectList(any())).thenReturn(List.of(entity));

        List<TelemetryPointDto> result = telemetryService.query(null, null, null, 1);

        assertEquals(1, result.size());
        assertEquals("--", result.get(0).time());
        assertNull(result.get(0).temperature());
    }

    @Test
    void shouldDeleteOlderThan30Days() {
        when(telemetryMapper.delete(any())).thenReturn(123);

        int deleted = telemetryService.deleteOlderThan30Days();

        assertEquals(123, deleted);
        verify(telemetryMapper).delete(any());
    }

    @Test
    void shouldRunScheduledCleanup() {
        when(telemetryMapper.delete(any())).thenReturn(10);

        telemetryService.scheduledRetentionCleanup();

        verify(telemetryMapper).delete(any());
    }

    @Test
    void shouldClampLimitToOneInQueryWrapper() {
        when(telemetryMapper.selectList(any())).thenReturn(List.of());

        telemetryService.query("DEV001", null, null, 0);

        ArgumentCaptor<QueryWrapper<TelemetryEntity>> captor = ArgumentCaptor.forClass(QueryWrapper.class);
        verify(telemetryMapper).selectList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        assertTrue(sqlSegment.contains("device_code"));
        assertTrue(sqlSegment.contains("LIMIT 1"));
    }

    @Test
    void shouldClampLimitToFiveHundredInQueryWrapper() {
        when(telemetryMapper.selectList(any())).thenReturn(List.of());

        telemetryService.query(null, null, null, 9999);

        ArgumentCaptor<QueryWrapper<TelemetryEntity>> captor = ArgumentCaptor.forClass(QueryWrapper.class);
        verify(telemetryMapper).selectList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        assertTrue(sqlSegment.contains("LIMIT 500"));
    }
}
