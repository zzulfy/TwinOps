package com.twinops.backend.analysis.service;

import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.math.BigDecimal;

@Component
@ConditionalOnProperty(prefix = "twinops.analysis.llm", name = "provider", havingValue = "mock")
public class MockLlmProviderAdapter implements LlmProviderAdapter {

    @Override
    public LlmPredictionResult predict(String deviceCode, String metricSummary) {
        String normalized = metricSummary.toLowerCase();
        if (normalized.contains("timeout")) {
            throw new RuntimeException("provider timeout");
        }
        String riskLevel = normalized.contains("overload") || normalized.contains("critical") ? "high" : "medium";
        BigDecimal confidence = "high".equals(riskLevel) ? BigDecimal.valueOf(86.5) : BigDecimal.valueOf(72.0);
        String prediction = "high".equals(riskLevel)
            ? "设备负载在未来 2 小时内可能触发告警阈值，请提前扩容或限流。"
            : "设备运行趋势平稳，但建议持续观察温度与 CPU 负载波动。";
        String action = "high".equals(riskLevel)
            ? "建议立即检查散热与流量策略，并准备故障切换。"
            : "建议保持常规巡检并在高峰时段提高采样频率。";
        return new LlmPredictionResult(prediction, confidence, riskLevel, action);
    }
}
