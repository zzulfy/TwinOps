package com.twinops.backend.device.service;

import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.DeviceDetailDto;
import com.twinops.backend.common.dto.SimulationDeviceDataDto;
import com.twinops.backend.common.exception.NotFoundException;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeviceServiceTest {

    @Mock
    private DeviceMapper deviceMapper;

    @Mock
    private TelemetryMapper telemetryMapper;

    @Mock
    private AlarmMapper alarmMapper;

    private DeviceService deviceService;

    @BeforeEach
    void setUp() {
        deviceService = new DeviceService(deviceMapper, telemetryMapper, alarmMapper);
    }

    @Test
    void shouldMapListDetailAndNormalizeStatusAndAlarmTypes() {
        DeviceEntity device = device("DEV001", "1# 服务器机柜", "服务器机柜", "unexpected");
        TelemetryEntity metric = metric("DEV001", new BigDecimal("24.5"), new BigDecimal("53.2"), new BigDecimal("219.0"),
            new BigDecimal("6.5"), new BigDecimal("1420.0"), new BigDecimal("45.0"), new BigDecimal("56.0"),
            new BigDecimal("48.0"), new BigDecimal("187.0"));

        AlarmEntity alarmError = alarm(1L, "DEV001", "温度过高", 3, LocalDateTime.of(2026, 3, 30, 9, 15));
        AlarmEntity alarmInfo = alarm(2L, "DEV001", "巡检提醒", null, null);

        when(deviceMapper.selectList(any())).thenReturn(List.of(device));
        when(telemetryMapper.selectOne(any())).thenReturn(metric);
        when(alarmMapper.selectList(any())).thenReturn(List.of(alarmError, alarmInfo));

        List<DeviceDetailDto> result = deviceService.list();

        assertEquals(1, result.size());
        DeviceDetailDto dto = result.get(0);
        assertEquals("DEV001", dto.deviceCode());
        assertEquals("1# 服务器机柜", dto.labelKey());
        assertEquals("normal", dto.status());
        assertEquals(new BigDecimal("24.5"), dto.temperature());
        assertEquals(new BigDecimal("187.0"), dto.networkTraffic());

        assertEquals(2, dto.alarms().size());
        assertEquals("error", dto.alarms().get(0).type());
        assertEquals("09:15", dto.alarms().get(0).time());
        assertEquals("info", dto.alarms().get(1).type());
        assertEquals("--:--", dto.alarms().get(1).time());
    }

    @Test
    void shouldReturnZeroMetricsWhenTelemetryMissing() {
        DeviceEntity device = device("DEV009", "9# 服务器机柜", "服务器机柜", null);

        when(deviceMapper.selectOne(any())).thenReturn(device);
        when(telemetryMapper.selectOne(any())).thenReturn(null);
        when(alarmMapper.selectList(any())).thenReturn(List.of());

        DeviceDetailDto dto = deviceService.getByDeviceCode("DEV009");

        assertEquals("normal", dto.status());
        assertEquals(BigDecimal.ZERO, dto.temperature());
        assertEquals(BigDecimal.ZERO, dto.humidity());
        assertEquals(BigDecimal.ZERO, dto.voltage());
        assertEquals(BigDecimal.ZERO, dto.current());
        assertEquals(BigDecimal.ZERO, dto.power());
        assertEquals(BigDecimal.ZERO, dto.cpuLoad());
        assertEquals(BigDecimal.ZERO, dto.memoryUsage());
        assertEquals(BigDecimal.ZERO, dto.diskUsage());
        assertEquals(BigDecimal.ZERO, dto.networkTraffic());
    }

    @Test
    void shouldThrowWhenDeviceNotFound() {
        when(deviceMapper.selectOne(any())).thenReturn(null);

        NotFoundException ex = assertThrows(NotFoundException.class,
            () -> deviceService.getByDeviceCode("DEV404"));

        assertEquals("device not found: DEV404", ex.getMessage());
    }

    @Test
    void shouldMapSimulationDataWithoutUiFields() {
        DeviceEntity device = device("DEV010", "10# 服务器机柜", "服务器机柜", "warning");
        TelemetryEntity metric = metric("DEV010", new BigDecimal("28.6"), new BigDecimal("57.2"), new BigDecimal("220.1"),
            new BigDecimal("6.2"), new BigDecimal("1490.0"), new BigDecimal("52.0"), new BigDecimal("58.0"),
            new BigDecimal("46.0"), new BigDecimal("196.0"));
        AlarmEntity alarm = alarm(10L, "DEV010", "湿度过高", 2, LocalDateTime.of(2026, 4, 12, 9, 11));

        when(deviceMapper.selectList(any())).thenReturn(List.of(device));
        when(telemetryMapper.selectOne(any())).thenReturn(metric);
        when(alarmMapper.selectList(any())).thenReturn(List.of(alarm));

        List<SimulationDeviceDataDto> result = deviceService.listSimulationData();

        assertEquals(1, result.size());
        SimulationDeviceDataDto dto = result.get(0);
        assertEquals("DEV010", dto.deviceCode());
        assertEquals("warning", dto.status());
        assertEquals("服务器机柜", dto.type());
        assertEquals(new BigDecimal("28.6"), dto.temperature());
        assertEquals("warning", dto.alarms().get(0).type());
    }

    private static DeviceEntity device(String code, String name, String type, String status) {
        DeviceEntity entity = new DeviceEntity();
        entity.setDeviceCode(code);
        entity.setLabelKey(name);
        entity.setName(name);
        entity.setType(type);
        entity.setStatus(status);
        entity.setSerialNumber("SN000001");
        entity.setLocation("数据中心 A 区 1 排");
        return entity;
    }

    private static TelemetryEntity metric(
        String code,
        BigDecimal temperature,
        BigDecimal humidity,
        BigDecimal voltage,
        BigDecimal current,
        BigDecimal power,
        BigDecimal cpuLoad,
        BigDecimal memoryUsage,
        BigDecimal diskUsage,
        BigDecimal networkTraffic
    ) {
        TelemetryEntity metric = new TelemetryEntity();
        metric.setDeviceCode(code);
        metric.setTemperature(temperature);
        metric.setHumidity(humidity);
        metric.setVoltage(voltage);
        metric.setCurrent(current);
        metric.setPower(power);
        metric.setCpuLoad(cpuLoad);
        metric.setMemoryUsage(memoryUsage);
        metric.setDiskUsage(diskUsage);
        metric.setNetworkTraffic(networkTraffic);
        return metric;
    }

    private static AlarmEntity alarm(Long id, String deviceCode, String event, Integer level, LocalDateTime occurredAt) {
        AlarmEntity alarm = new AlarmEntity();
        alarm.setId(id);
        alarm.setDeviceCode(deviceCode);
        alarm.setEvent(event);
        alarm.setLevel(level);
        alarm.setOccurredAt(occurredAt);
        return alarm;
    }
}
