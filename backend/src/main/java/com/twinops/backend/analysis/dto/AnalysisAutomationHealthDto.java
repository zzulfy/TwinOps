package com.twinops.backend.analysis.dto;

public record AnalysisAutomationHealthDto(
    String status,
    boolean automationEnabled,
    boolean listenerRegistered,
    boolean listenerRunning,
    boolean kafkaReachable,
    String topic,
    String bootstrapServers,
    String message
) {
}

