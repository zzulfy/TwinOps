package com.twinops.backend.analysis.service;

import java.math.BigDecimal;

public record LlmPredictionResult(
    String prediction,
    BigDecimal confidence,
    String riskLevel,
    String recommendedAction
) {
}
