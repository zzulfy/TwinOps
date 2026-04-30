package com.twinops.backend.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.analysis.dto.AnalysisCausalEdgeDto;
import com.twinops.backend.analysis.dto.AnalysisRootCauseDto;
import com.twinops.backend.common.logging.LogFields;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
@Primary
@ConditionalOnProperty(prefix = "twinops.analysis.llm", name = "provider", havingValue = "openai", matchIfMissing = true)
public class OpenAiLlmProviderAdapter implements LlmProviderAdapter {

    private static final Logger log = LoggerFactory.getLogger(OpenAiLlmProviderAdapter.class);
    private static final Duration HTTP_TIMEOUT = Duration.ofSeconds(10);
    private static final String CHAT_COMPLETION_SUFFIX = "/chat/completions";

    private final ObjectMapper objectMapper;
    private volatile ChatModel chatModel;
    private volatile ChatModel reportChatModel;
    private final Object modelInitLock = new Object();
    private final Object reportModelInitLock = new Object();
    private final String endpoint;
    private final String apiKey;
    private final String model;
    private final double temperature;
    private final int maxTokens;
    private final int reportMaxTokens;
    private final boolean fallbackToMock;

    @Autowired
    public OpenAiLlmProviderAdapter(
        @Value("${twinops.analysis.llm.base-url:https://ark.cn-beijing.volces.com/api/coding/v3}") String baseUrl,
        @Value("${twinops.analysis.llm.api-key:}") String apiKey,
        @Value("${twinops.analysis.llm.model:ark-code-latest}") String model,
        @Value("${twinops.analysis.llm.temperature:0.2}") double temperature,
        @Value("${twinops.analysis.llm.max-tokens:512}") int maxTokens,
        @Value("${twinops.analysis.llm.report-max-tokens:2048}") int reportMaxTokens,
        @Value("${twinops.analysis.llm.fallback-to-mock:true}") boolean fallbackToMock
    ) {
        this.objectMapper = new ObjectMapper();
        this.endpoint = trimTrailingSlash(baseUrl);
        this.chatModel = null;
        this.apiKey = apiKey;
        this.model = model;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.reportMaxTokens = reportMaxTokens;
        this.fallbackToMock = fallbackToMock;
    }

    OpenAiLlmProviderAdapter(
        ChatModel chatModel,
        String endpoint,
        String apiKey,
        String model,
        double temperature,
        int maxTokens,
        boolean fallbackToMock
    ) {
        this.objectMapper = new ObjectMapper();
        this.chatModel = chatModel;
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.model = model;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.reportMaxTokens = 2048;
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

            ChatResponse response = getOrCreateChatModel().chat(buildMessages(deviceCode, metricSummary));
            if (response == null || response.aiMessage() == null) {
                throw new RuntimeException("llm response missing ai message");
            }
            String content = response.aiMessage().text();
            if (content == null || content.isBlank()) {
                throw new RuntimeException("llm response missing message text");
            }

            JsonNode payload = parseModelContent(content);
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
                LlmPredictionResult fallback = fallback(metricSummary);
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

    @Override
    public String generateReport(
        String deviceCode,
        String metricSummary,
        List<AnalysisRootCauseDto> rootCauses,
        List<AnalysisCausalEdgeDto> causalEdges,
        String prediction,
        String riskLevel,
        String recommendedAction
    ) {
        long startNanos = System.nanoTime();
        try {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("llm api key is missing");
            }
            log.info("{}={} {}={} {}={} {}={} provider=openai endpoint={} model={} deviceCode={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "llm.report.start",
                LogFields.RESULT, "started",
                endpoint,
                model,
                deviceCode
            );

            String rootCauseText = (rootCauses == null || rootCauses.isEmpty())
                ? "无显著根因设备"
                : rootCauses.stream()
                    .map(rc -> rc.deviceCode() + "（评分:" + String.format("%.2f", rc.score() == null ? 0.0 : rc.score()) + "，排名:#" + rc.rank() + "）")
                    .collect(Collectors.joining("; "));

            String causalEdgeText = (causalEdges == null || causalEdges.isEmpty())
                ? "无显著因果边"
                : causalEdges.stream()
                    .map(e -> e.fromDeviceCode() + "→" + e.toDeviceCode() + "（权重:" + String.format("%.2f", e.weight() == null ? 0.0 : e.weight()) + "）")
                    .collect(Collectors.joining("; "));

            ChatResponse response = getOrCreateReportChatModel().chat(List.of(
                SystemMessage.from("你是一个工业运维分析助手。请基于提供的分析数据生成一份结构化的中文综合报告。使用 Markdown 格式，包含 ## 标题和段落。不要返回 JSON，直接返回报告文本。"),
                UserMessage.from("""
                    请基于以下数据生成一份综合运维分析报告，包含以下四个部分：
                    1. 指标摘要 — 概括当前系统指标状况
                    2. Top Root Cause 总结 — 解读根因分析结果
                    3. Causal Edges 总结 — 解读因果传播关系
                    4. 未来预防和解决措施 — 基于分析给出具体建议

                    设备: %s
                    指标摘要: %s
                    Top Root Causes: %s
                    Causal Edges: %s
                    LLM 预测: %s
                    风险等级: %s
                    建议动作: %s

                    要求：每部分使用 ### 子标题，内容简洁专业，措施具体可操作。
                    """.formatted(deviceCode, metricSummary, rootCauseText, causalEdgeText,
                        prediction, riskLevel, recommendedAction))
            ));

            if (response == null || response.aiMessage() == null || response.aiMessage().text() == null) {
                throw new RuntimeException("llm report response empty");
            }
            String report = response.aiMessage().text().trim();
            if (report.startsWith("```")) {
                int firstLineEnd = report.indexOf('\n');
                int lastFence = report.lastIndexOf("```");
                if (firstLineEnd > 0 && lastFence > firstLineEnd) {
                    report = report.substring(firstLineEnd + 1, lastFence).trim();
                }
            }

            long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
            log.info("{}={} {}={} {}={} {}={} {}={} deviceCode={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "llm.report.complete",
                LogFields.RESULT, "success",
                LogFields.LATENCY_MS, latencyMs,
                deviceCode
            );
            return report;
        } catch (Exception ex) {
            long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
            log.warn("{}={} {}={} {}={} {}={} {}={} {}={} deviceCode={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "llm.report.failed",
                LogFields.RESULT, "fallback",
                LogFields.ERROR_CODE, "LLM_REPORT_FAILED",
                LogFields.LATENCY_MS, latencyMs,
                deviceCode,
                ex.getMessage()
            );
            return LlmProviderAdapter.super.generateReport(
                deviceCode, metricSummary, rootCauses, causalEdges,
                prediction, riskLevel, recommendedAction
            );
        }
    }

    private ChatModel getOrCreateChatModel() {
        ChatModel cached = this.chatModel;
        if (cached != null) {
            return cached;
        }
        synchronized (modelInitLock) {
            if (this.chatModel == null) {
                this.chatModel = OpenAiChatModel.builder()
                    .baseUrl(toLangChainBaseUrl(this.endpoint))
                    .apiKey(apiKey)
                    .modelName(model)
                    .temperature(temperature)
                    .maxTokens(maxTokens)
                    .timeout(HTTP_TIMEOUT)
                    .maxRetries(0)
                    .build();
            }
            return this.chatModel;
        }
    }

    private ChatModel getOrCreateReportChatModel() {
        ChatModel cached = this.reportChatModel;
        if (cached != null) {
            return cached;
        }
        synchronized (reportModelInitLock) {
            if (this.reportChatModel == null) {
                this.reportChatModel = OpenAiChatModel.builder()
                    .baseUrl(toLangChainBaseUrl(this.endpoint))
                    .apiKey(apiKey)
                    .modelName(model)
                    .temperature(temperature)
                    .maxTokens(reportMaxTokens)
                    .timeout(HTTP_TIMEOUT)
                    .maxRetries(0)
                    .build();
            }
            return this.reportChatModel;
        }
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
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

    private List<ChatMessage> buildMessages(String deviceCode, String metricSummary) {
        return List.of(
            SystemMessage.from("You are an industrial operations analysis assistant. Return only JSON with keys: prediction, confidence, riskLevel, recommendedAction."),
            UserMessage.from("""
                Analyze the following telemetry summary and predict short-term operational risk.
                deviceCode: %s
                metricSummary: %s

                Rules:
                1) riskLevel must be one of: low, medium, high.
                2) confidence is a number between 0 and 100.
                3) Return JSON only, no markdown, no extra text.
                """.formatted(deviceCode, metricSummary))
        );
    }

    static String toLangChainBaseUrl(String endpoint) {
        String normalized = trimTrailingSlash(endpoint);
        if (normalized.toLowerCase(Locale.ROOT).endsWith(CHAT_COMPLETION_SUFFIX)) {
            return normalized.substring(0, normalized.length() - CHAT_COMPLETION_SUFFIX.length());
        }
        return normalized;
    }

    private static String trimTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
