package com.twinops.backend.common.dto;

import java.math.BigDecimal;
import java.util.List;

public record SimulationDeviceDataDto(
    String deviceCode,
    String type,
    String status,
    String serialNumber,
    String location,
    BigDecimal temperature,
    BigDecimal humidity,
    BigDecimal voltage,
    BigDecimal current,
    BigDecimal power,
    BigDecimal cpuLoad,
    BigDecimal memoryUsage,
    BigDecimal diskUsage,
    BigDecimal networkTraffic,
    List<DeviceAlarmDto> alarms
) {
}
