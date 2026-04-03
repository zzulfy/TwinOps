package com.twinops.backend.dashboard.service;

import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.DashboardSummaryDto;
import com.twinops.backend.common.dto.DeviceScaleItemDto;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
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

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(deviceMapper, alarmMapper, telemetryMapper);
    }

    @Test
    void shouldAggregateScaleAndMapAlarmAndSeries() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(
            device("DEV001", "服务器机柜"),
            device("DEV002", "服务器机柜"),
            device("DEV003", "网络设备")
        ));

        when(alarmMapper.selectList(any())).thenReturn(List.of(
            alarm(1L, "1# 服务器机柜", "温度过高", 2, "new", LocalDateTime.of(2026, 3, 30, 8, 21)),
            alarm(2L, "2# 网络设备", "网络波动", 1, "acknowledged", null)
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
        assertEquals(List.of(58.8), summary.faultRate().values());

        assertEquals(List.of("10:00", "10:05"), summary.resourceUsage().labels());
        assertEquals(List.of(50.0, 400.0), summary.resourceUsage().values());
    }

    @Test
    void shouldFallbackToDefaultIconForUnknownType() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(device("DEV100", "未知设备")));
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

    private static DeviceEntity device(String code, String type) {
        DeviceEntity entity = new DeviceEntity();
        entity.setDeviceCode(code);
        entity.setType(type);
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
