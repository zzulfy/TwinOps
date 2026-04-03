package com.twinops.backend.analysis.dto;

public record AnalysisReportDto(
    Long id,
    String deviceCode,
    String metricSummary,
    String prediction,
    Double confidence,
    String riskLevel,
    String recommendedAction,
    String status,
    String errorMessage,
    String createdAt
) {
}
