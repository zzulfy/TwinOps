package com.twinops.backend.analysis.dto;

public record AnalysisAutomationMessage(
    String jobType,
    String deviceCode,
    String metricSummary,
    String slot,
    String idempotencyKey,
    Long reportId
) {
}
