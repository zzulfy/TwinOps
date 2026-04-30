package com.twinops.backend.dashboard.service;

import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.DashboardSummaryDto;
import com.twinops.backend.common.dto.DeviceScaleItemDto;
import com.twinops.backend.common.dto.FaultRateTrendDto;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.analysis.service.LlmPredictionResult;
import com.twinops.backend.analysis.service.LlmProviderAdapter;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private DeviceMapper deviceMapper;

    @Mock
    private AlarmMapper alarmMapper;

    @Mock
    private TelemetryMapper telemetryMapper;

    @Mock
    private LlmProviderAdapter llmProviderAdapter;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(deviceMapper, alarmMapper, telemetryMapper, llmProviderAdapter);
    }

    @Test
    void shouldAggregateScaleAndMapAlarmAndSeries() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(
            device("DEV001", "服务器机柜", "normal"),
            device("DEV002", "服务器机柜", "error"),
            device("DEV003", "网络设备", "normal")
        ));

        when(alarmMapper.selectList(any())).thenReturn(List.of(
            alarm(1L, "1# 服务器机柜", "温度过高", 2, "new", LocalDateTime.of(2026, 3, 30, 8, 21)),
            alarm(2L, "2# 网络设备", "网络波动", 1, "resolved", null)
        ));

        List<TelemetryEntity> metricsDesc = List.of(
            metric(LocalDateTime.of(2026, 3, 30, 10, 5), new BigDecimal("400")),
            metric(LocalDateTime.of(2026, 3, 30, 10, 0), new BigDecimal("50"))
        );
        when(telemetryMapper.selectList(any())).thenReturn(metricsDesc, metricsDesc);

        DashboardSummaryDto summary = dashboardService.summary();

        Map<String, DeviceScaleItemDto> scaleByType = summary.deviceScale().stream()
            .collect(Collectors.toMap(DeviceScaleItemDto::label, i -> i));
        assertEquals("2", scaleByType.get("服务器机柜").value());
        assertEquals("fa-solid fa-server", scaleByType.get("服务器机柜").icon());
        assertEquals("1", scaleByType.get("网络设备").value());
        assertEquals("fa-solid fa-network-wired", scaleByType.get("网络设备").icon());

        assertEquals(2, summary.alarms().size());
        assertEquals("08:21", summary.alarms().get(0).time());
        assertEquals("--:--", summary.alarms().get(1).time());

        assertEquals(List.of("10:00"), summary.faultRate().labels());
        assertEquals(List.of(33.3), summary.faultRate().values());

        assertEquals(List.of("10:00", "10:05"), summary.resourceUsage().labels());
        assertEquals(List.of(50.0, 400.0), summary.resourceUsage().values());
    }

    @Test
    void shouldFallbackToDefaultIconForUnknownType() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(device("DEV100", "未知设备", "normal")));
        when(alarmMapper.selectList(any())).thenReturn(List.of());
        when(telemetryMapper.selectList(any())).thenReturn(List.of(), List.of());

        DashboardSummaryDto summary = dashboardService.summary();

        assertEquals(1, summary.deviceScale().size());
        DeviceScaleItemDto item = summary.deviceScale().get(0);
        assertEquals("未知设备", item.label());
        assertEquals("fa-solid fa-server", item.icon());
        assertEquals("1", item.value());
        assertTrue(summary.faultRate().labels().isEmpty());
        assertTrue(summary.resourceUsage().labels().isEmpty());
    }

    @Test
    void shouldReturnMinuteLevelHistoryAndFiveMinuteForecast() throws Exception {
        when(deviceMapper.selectList(any())).thenReturn(List.of(
            device("DEV001", "服务器机柜", "error"),
            device("DEV002", "网络设备", "normal"),
            device("DEV003", "电源柜", "normal")
        ));
        when(llmProviderAdapter.predict(any(), any())).thenReturn(
            new LlmPredictionResult("趋势平稳", new BigDecimal("80"), "medium", "继续观察")
        );

        FaultRateTrendDto trend = dashboardService.faultRateTrend(
            LocalDateTime.of(2026, 4, 6, 10, 0),
            LocalDateTime.of(2026, 4, 6, 10, 3),
            5
        );

        assertEquals("minute", trend.granularity());
        assertEquals(1, trend.precision());
        assertEquals(4, trend.history().size());
        assertEquals("10:00", trend.history().get(0).time());
        assertEquals(33.3, trend.history().get(0).value());
        assertEquals(33.3, trend.history().get(2).value());
        assertEquals(5, trend.forecast().size());
        assertEquals("10:04", trend.forecast().get(0).time());
        // Compounding logistic growth from 33.3% base, k=0.02
        assertEquals(33.7, trend.forecast().get(0).value());
        assertEquals(80.0, trend.forecast().get(0).confidence());
        assertTrue(trend.forecast().get(4).value() > trend.forecast().get(0).value(),
            "forecast should compound upward when failures persist");
    }

    @Test
    void shouldReturnZeroFaultRateWhenNoErrorDevices() throws Exception {
        when(deviceMapper.selectList(any())).thenReturn(List.of(
            device("DEV010", "服务器机柜", "normal"),
            device("DEV011", "网络设备", "warning")
        ));
        when(llmProviderAdapter.predict(any(), any())).thenReturn(
            new LlmPredictionResult("趋势平稳", new BigDecimal("75"), "medium", "继续观察")
        );

        FaultRateTrendDto trend = dashboardService.faultRateTrend(
            LocalDateTime.of(2026, 4, 6, 11, 0),
            LocalDateTime.of(2026, 4, 6, 11, 2),
            5
        );

        assertEquals(0.0, trend.history().get(0).value());
        assertEquals(0.0, trend.forecast().get(0).value());
    }

    private static DeviceEntity device(String code, String type, String status) {
        DeviceEntity entity = new DeviceEntity();
        entity.setDeviceCode(code);
        entity.setType(type);
        entity.setStatus(status);
        return entity;
    }

    private static AlarmEntity alarm(Long id, String deviceName, String event, Integer level, String status, LocalDateTime occurredAt) {
        AlarmEntity alarm = new AlarmEntity();
        alarm.setId(id);
        alarm.setDeviceName(deviceName);
        alarm.setEvent(event);
        alarm.setLevel(level);
        alarm.setStatus(status);
        alarm.setOccurredAt(occurredAt);
        return alarm;
    }

    private static TelemetryEntity metric(LocalDateTime time, BigDecimal cpuLoad) {
        TelemetryEntity entity = new TelemetryEntity();
        entity.setMetricTime(time);
        entity.setCpuLoad(cpuLoad);
        return entity;
    }
}
