package com.twinops.backend.analysis.dto;

public record AnalysisReportDto(
    Long id,
    String deviceCode,
    String metricSummary,
    String prediction,
    Double confidence,
    String riskLevel,
    String recommendedAction,
    String engine,
    String rcaStatus,
    java.util.List<AnalysisRootCauseDto> rootCauses,
    java.util.List<AnalysisCausalEdgeDto> causalEdges,
    String modelVersion,
    String evidenceWindowStart,
    String evidenceWindowEnd,
    String status,
    String errorMessage,
    String createdAt,
    String report
) {
}
