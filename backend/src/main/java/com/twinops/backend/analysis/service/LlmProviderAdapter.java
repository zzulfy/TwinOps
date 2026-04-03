package com.twinops.backend.analysis.service;

public interface LlmProviderAdapter {

    LlmPredictionResult predict(String deviceCode, String metricSummary) throws Exception;
}
