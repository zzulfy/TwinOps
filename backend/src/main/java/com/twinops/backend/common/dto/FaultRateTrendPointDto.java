package com.twinops.backend.common.dto;

public record FaultRateTrendPointDto(
    String time,
    Double value,
    boolean forecast,
    Double confidence
) {
}

