package com.twinops.backend.common.dto;

import java.util.List;

public record FaultRateTrendDto(
    List<FaultRateTrendPointDto> history,
    List<FaultRateTrendPointDto> forecast,
    String granularity,
    int precision
) {
}

