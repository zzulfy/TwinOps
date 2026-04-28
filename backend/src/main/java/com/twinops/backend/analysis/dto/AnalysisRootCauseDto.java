package com.twinops.backend.analysis.dto;

public record AnalysisRootCauseDto(
    String deviceCode,
    Double score,
    Integer rank
) {
}
