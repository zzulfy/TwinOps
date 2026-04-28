package com.twinops.backend.analysis.dto;

import java.util.List;

public record RcaInferenceRequestDto(
    String requestId,
    String profile,
    String windowStart,
    String windowEnd,
    int stepMinutes,
    List<RcaInferenceDeviceDto> devices,
    List<List<Double>> series
) {
}
