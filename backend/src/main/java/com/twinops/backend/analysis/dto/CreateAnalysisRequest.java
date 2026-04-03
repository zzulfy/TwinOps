package com.twinops.backend.analysis.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateAnalysisRequest(
    @NotBlank(message = "deviceCode is required")
    String deviceCode,
    @NotBlank(message = "metricSummary is required")
    String metricSummary
) {
}
