package com.twinops.backend.analysis.dto;

public record AnalysisCausalEdgeDto(
    String fromDeviceCode,
    String toDeviceCode,
    Double weight
) {
}
