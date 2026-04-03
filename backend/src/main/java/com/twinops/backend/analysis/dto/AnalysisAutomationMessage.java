package com.twinops.backend.analysis.dto;

public record AnalysisAutomationMessage(
    String deviceCode,
    String metricSummary,
    String slot,
    String idempotencyKey
) {
}
