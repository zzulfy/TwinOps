package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.RcaInferenceDeviceDto;

import java.time.LocalDateTime;
import java.util.List;

public record DeviceRcaFeatureWindow(
    String requestId,
    LocalDateTime windowStart,
    LocalDateTime windowEnd,
    int stepMinutes,
    List<RcaInferenceDeviceDto> devices,
    List<List<Double>> series
) {
}
