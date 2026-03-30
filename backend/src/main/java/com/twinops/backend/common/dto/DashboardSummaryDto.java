package com.twinops.backend.common.dto;

import java.util.List;

public record DashboardSummaryDto(
    List<DeviceScaleItemDto> deviceScale,
    List<AlarmItemDto> alarms,
    ChartSeriesDto faultRate,
    ChartSeriesDto resourceUsage
) {
}
