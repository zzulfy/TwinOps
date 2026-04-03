package com.twinops.backend.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.common.logging.LogFields;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@Component
@Primary
@ConditionalOnProperty(prefix = "twinops.analysis.llm", name = "provider", havingValue = "openai", matchIfMissing = true)
public class OpenAiLlmProviderAdapter implements LlmProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(OpenAiLlmProviderAdapter.class);
    private static final Duration HTTP_TIMEOUT = Duration.ofSeconds(10);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String endpoint;
    private final String apiKey;
    private final String model;
    private final double temperature;
    private final int maxTokens;
    private final boolean fallbackToMock;

    public OpenAiLlmProviderAdapter(
        @Value("${twinops.analysis.llm.base-url:https://ark.cn-beijing.volces.com/api/coding/v3}") String baseUrl,
        @Value("${twinops.analysis.llm.path:/chat/completions}") String path,
        @Value("${twinops.analysis.llm.api-key:}") String apiKey,
        @Value("${twinops.analysis.llm.model:ark-code-latest}") String model,
        @Value("${twinops.analysis.llm.temperature:0.2}") double temperature,
        @Value("${twinops.analysis.llm.max-tokens:512}") int maxTokens,
        @Value("${twinops.analysis.llm.fallback-to-mock:true}") boolean fallbackToMock
    ) {
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder().connectTimeout(HTTP_TIMEOUT).build();
        this.endpoint = normalizeEndpoint(baseUrl, path);
        this.apiKey = apiKey;
        this.model = model;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.fallbackToMock = fallbackToMock;
    }

    @Override
    public LlmPredictionResult predict(String deviceCode, String metricSummary) throws Exception {
        long startNanos = System.nanoTime();
        try {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("llm api key is missing");
            }
            log.info("{}={} {}={} {}={} {}={} provider=openai endpoint={} model={} deviceCode={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "llm.request.start",
                LogFields.RESULT, "started",
                endpoint,
                model,
                deviceCode
            );

            String body = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "temperature", temperature,
                "max_tokens", maxTokens,
                "messages", List.of(
                    Map.of(
                        "role", "system",
                        "content", "You are an industrial operations analysis assistant. Return only JSON with keys: prediction, confidence, riskLevel, recommendedAction."
                    ),
                    Map.of(
                        "role", "user",
                        "content", """
                            Analyze the following telemetry summary and predict short-term operational risk.
                            deviceCode: %s
                            metricSummary: %s
                            
                            Rules:
                            1) riskLevel must be one of: low, medium, high.
                            2) confidence is a number between 0 and 100.
                            3) Return JSON only, no markdown, no extra text.
                            """.formatted(deviceCode, metricSummary)
                    )
                )
            ));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(HTTP_TIMEOUT)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("llm http " + response.statusCode() + ": " + truncate(response.body()));
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || contentNode.isNull() || contentNode.asText().isBlank()) {
                throw new RuntimeException("llm response missing choices[0].message.content");
            }

            JsonNode payload = parseModelContent(contentNode.asText());
            String prediction = payload.path("prediction").asText("").trim();
            String recommendedAction = payload.path("recommendedAction").asText("").trim();
            if (prediction.isBlank()) {
                throw new RuntimeException("llm response missing prediction");
            }
            if (recommendedAction.isBlank()) {
                recommendedAction = "建议持续观察关键指标并准备应急预案。";
            }

            BigDecimal confidence = BigDecimal.valueOf(payload.path("confidence").asDouble(70D))
                .setScale(2, RoundingMode.HALF_UP);
            if (confidence.compareTo(BigDecimal.ZERO) < 0) {
                confidence = BigDecimal.ZERO;
            }
            if (confidence.compareTo(BigDecimal.valueOf(100)) > 0) {
                confidence = BigDecimal.valueOf(100);
            }

            String riskLevel = normalizeRiskLevel(payload.path("riskLevel").asText(""));
            long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
            log.info("{}={} {}={} {}={} {}={} {}={} deviceCode={} riskLevel={} confidence={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "llm.request.complete",
                LogFields.RESULT, "success",
                LogFields.LATENCY_MS, latencyMs,
                deviceCode,
                riskLevel,
                confidence
            );
            return new LlmPredictionResult(prediction, confidence, riskLevel, recommendedAction);
        } catch (Exception ex) {
            if (fallbackToMock) {
                long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
                log.warn("{}={} {}={} {}={} {}={} {}={} {}={} deviceCode={} message={}",
                    LogFields.REQUEST_ID, safeRequestId(),
                    LogFields.MODULE, "analysis",
                    LogFields.EVENT, "llm.request.failed",
                    LogFields.RESULT, "fallback",
                    LogFields.ERROR_CODE, "LLM_PROVIDER_FAILED",
                    LogFields.LATENCY_MS, latencyMs,
                    deviceCode,
                    ex.getMessage()
                );
                LlmPredictionResult fallback = localFallback(metricSummary);
                log.info("{}={} {}={} {}={} {}={} deviceCode={} riskLevel={} confidence={}",
                    LogFields.REQUEST_ID, safeRequestId(),
                    LogFields.MODULE, "analysis",
                    LogFields.EVENT, "llm.fallback.complete",
                    LogFields.RESULT, "success",
                    deviceCode,
                    fallback.riskLevel(),
                    fallback.confidence()
                );
                return fallback;
            }
            long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
            log.error("{}={} {}={} {}={} {}={} {}={} {}={} deviceCode={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "llm.request.failed",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "LLM_PROVIDER_FAILED",
                LogFields.LATENCY_MS, latencyMs,
                deviceCode,
                ex.getMessage(),
                ex
            );
            throw ex;
        }
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }

    private LlmPredictionResult localFallback(String metricSummary) {
        String normalized = metricSummary == null ? "" : metricSummary.toLowerCase(Locale.ROOT);
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

    private JsonNode parseModelContent(String content) throws IOException {
        String trimmed = content.trim();
        if (trimmed.startsWith("```")) {
            int firstLineEnd = trimmed.indexOf('\n');
            int lastFence = trimmed.lastIndexOf("```");
            if (firstLineEnd > 0 && lastFence > firstLineEnd) {
                trimmed = trimmed.substring(firstLineEnd + 1, lastFence).trim();
            }
        }
        return objectMapper.readTree(trimmed);
    }

    private String normalizeRiskLevel(String level) {
        return switch (level == null ? "" : level.trim().toLowerCase()) {
            case "low", "medium", "high" -> level.trim().toLowerCase();
            default -> "medium";
        };
    }

    private String normalizeEndpoint(String baseUrl, String path) {
        String base = baseUrl == null ? "" : baseUrl.trim();
        String suffix = path == null ? "" : path.trim();
        if (base.endsWith("/") && suffix.startsWith("/")) {
            return base.substring(0, base.length() - 1) + suffix;
        }
        if (!base.endsWith("/") && !suffix.startsWith("/")) {
            return base + "/" + suffix;
        }
        return base + suffix;
    }

    private String truncate(String input) {
        if (input == null) {
            return "";
        }
        return input.length() <= 240 ? input : input.substring(0, 240) + "...";
    }
}
