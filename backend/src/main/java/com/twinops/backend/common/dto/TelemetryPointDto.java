package com.twinops.backend.common.dto;

import java.math.BigDecimal;

public record TelemetryPointDto(
    String time,
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
}
