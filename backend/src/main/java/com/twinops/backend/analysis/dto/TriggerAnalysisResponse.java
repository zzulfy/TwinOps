package com.twinops.backend.analysis.dto;

public record TriggerAnalysisResponse(
    String triggerId,
    Long reportId,
    String status,
    int targetCount,
    int acceptedCount,
    int failedCount
) {
}
