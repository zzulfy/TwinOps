package com.twinops.backend.analysis.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.analysis.dto.AnalysisCausalEdgeDto;
import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.dto.AnalysisRootCauseDto;
import com.twinops.backend.analysis.entity.AnalysisReportEntity;
import com.twinops.backend.analysis.mapper.AnalysisReportMapper;
import com.twinops.backend.common.exception.NotFoundException;
import com.twinops.backend.common.logging.LogFields;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.DateTimeException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
public class AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final ObjectMapper REPORT_OBJECT_MAPPER = new ObjectMapper();
    private static final Duration PROVIDER_TIMEOUT = Duration.ofSeconds(15);
    private static final int MAX_RETRY = 2;
    private static final Duration PROCESSING_STALE_TIMEOUT = Duration.ofMinutes(10);

    private final AnalysisReportMapper analysisReportMapper;
    private final LlmProviderAdapter llmProviderAdapter;
    private final ZoneId storageZoneId;
    private final ZoneId displayZoneId;
    private final Clock clock;

    @Autowired
    public AnalysisService(
        AnalysisReportMapper analysisReportMapper,
        LlmProviderAdapter llmProviderAdapter,
        @Value("${twinops.analysis.time.storage-zone-id:UTC}") String storageZoneId,
        @Value("${twinops.analysis.time.display-zone-id:Asia/Shanghai}") String displayZoneId
    ) {
        this(analysisReportMapper, llmProviderAdapter, storageZoneId, displayZoneId, Clock.systemUTC());
    }

    public AnalysisService(AnalysisReportMapper analysisReportMapper, LlmProviderAdapter llmProviderAdapter) {
        this(analysisReportMapper, llmProviderAdapter, "UTC", "Asia/Shanghai", Clock.systemUTC());
    }

    AnalysisService(
        AnalysisReportMapper analysisReportMapper,
        LlmProviderAdapter llmProviderAdapter,
        String storageZoneId,
        String displayZoneId,
        Clock clock
    ) {
        this.analysisReportMapper = analysisReportMapper;
        this.llmProviderAdapter = llmProviderAdapter;
        this.storageZoneId = parseZoneId(storageZoneId, "twinops.analysis.time.storage-zone-id", ZoneOffset.UTC);
        this.displayZoneId = parseZoneId(displayZoneId, "twinops.analysis.time.display-zone-id", ZoneId.of("Asia/Shanghai"));
        this.clock = clock;
    }

    public AnalysisReportDto createReport(String deviceCode, String metricSummary) {
        return createReportInternal(deviceCode, metricSummary, null, AnalysisRcaPayload.fallback(null, null));
    }

    public AnalysisReportDto createProcessingReport(String deviceCode, String metricSummary, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            QueryWrapper<AnalysisReportEntity> query = new QueryWrapper<>();
            query.eq("idempotency_key", idempotencyKey).last("LIMIT 1");
            AnalysisReportEntity existing = analysisReportMapper.selectOne(query);
            if (existing != null) {
                return toDto(existing);
            }
        }
        AnalysisReportEntity report = new AnalysisReportEntity();
        report.setDeviceCode(deviceCode);
        report.setMetricSummary(metricSummary);
        report.setIdempotencyKey(idempotencyKey);
        report.setStatus("processing");
        analysisReportMapper.insert(report);
        return toDto(report);
    }

    public AnalysisReportDto failExistingProcessingReport(Long reportId, String errorMessage) {
        AnalysisReportEntity report = analysisReportMapper.selectById(reportId);
        if (report == null) {
            throw new NotFoundException("analysis report not found: " + reportId);
        }
        report.setStatus("failed");
        report.setErrorMessage(errorMessage);
        analysisReportMapper.updateById(report);
        return toDto(report);
    }

    public AnalysisReportDto createReportWithIdempotency(String deviceCode, String metricSummary, String idempotencyKey) {
        return createReportWithIdempotency(deviceCode, metricSummary, idempotencyKey, AnalysisRcaPayload.fallback(null, null));
    }

    public AnalysisReportDto createReportWithIdempotency(
        String deviceCode,
        String metricSummary,
        String idempotencyKey,
        AnalysisRcaPayload rcaPayload
    ) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            QueryWrapper<AnalysisReportEntity> query = new QueryWrapper<>();
            query.eq("idempotency_key", idempotencyKey).last("LIMIT 1");
            AnalysisReportEntity existing = analysisReportMapper.selectOne(query);
            if (existing != null) {
                if ("processing".equalsIgnoreCase(existing.getStatus())) {
                    return completeExistingReport(existing, deviceCode, metricSummary, rcaPayload);
                }
                log.info("{}={} {}={} {}={} {}={} {}={} idempotencyKey={} reportId={} deviceCode={}",
                    LogFields.REQUEST_ID, safeRequestId(),
                    LogFields.MODULE, "analysis",
                    LogFields.EVENT, "analysis.create.idempotent_skip",
                    LogFields.RESULT, "success",
                    LogFields.ERROR_CODE, "DUPLICATE_ANALYSIS_REQUEST",
                    idempotencyKey,
                    existing.getId(),
                    existing.getDeviceCode()
                );
                return toDto(existing);
            }
        }
        return createReportInternal(deviceCode, metricSummary, idempotencyKey, rcaPayload);
    }

    private AnalysisReportDto completeExistingReport(
        AnalysisReportEntity report,
        String deviceCode,
        String metricSummary,
        AnalysisRcaPayload rcaPayload
    ) {
        long startNanos = System.nanoTime();
        report.setDeviceCode(deviceCode);
        report.setMetricSummary(metricSummary);
        applyRcaPayload(report, rcaPayload);
        int attempt = 0;
        while (attempt <= MAX_RETRY) {
            try {
                LlmPredictionResult result = callWithTimeout(deviceCode, metricSummary);
                report.setPrediction(result.prediction());
                report.setConfidence(result.confidence());
                report.setRiskLevel(result.riskLevel());
                report.setRecommendedAction(result.recommendedAction());
                report.setReport(buildReportSafe(report, metricSummary, result));
                report.setStatus("success");
                report.setErrorMessage(null);
                analysisReportMapper.updateById(report);
                long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
                log.info("{}={} {}={} {}={} {}={} {}={} reportId={} deviceCode={}",
                    LogFields.REQUEST_ID, safeRequestId(),
                    LogFields.MODULE, "analysis",
                    LogFields.EVENT, "analysis.create.complete",
                    LogFields.RESULT, "success",
                    LogFields.LATENCY_MS, latencyMs,
                    report.getId(),
                    deviceCode
                );
                return toDto(report);
            } catch (Exception ex) {
                attempt += 1;
                if (attempt > MAX_RETRY) {
                    return applyFallbackAndSave(report, metricSummary);
                }
            }
        }
        return applyFallbackAndSave(report, metricSummary);
    }

    private AnalysisReportDto createReportInternal(
        String deviceCode,
        String metricSummary,
        String idempotencyKey,
        AnalysisRcaPayload rcaPayload
    ) {
        long startNanos = System.nanoTime();
        log.info("{}={} {}={} {}={} {}={} deviceCode={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.create.start",
            LogFields.RESULT, "started",
            deviceCode
        );
        AnalysisReportEntity report = new AnalysisReportEntity();
        report.setDeviceCode(deviceCode);
        report.setMetricSummary(metricSummary);
        report.setIdempotencyKey(idempotencyKey);
        report.setStatus("processing");
        applyRcaPayload(report, rcaPayload);
        analysisReportMapper.insert(report);

        int attempt = 0;
        while (attempt <= MAX_RETRY) {
            try {
                LlmPredictionResult result = callWithTimeout(deviceCode, metricSummary);
                report.setPrediction(result.prediction());
                report.setConfidence(result.confidence());
                report.setRiskLevel(result.riskLevel());
                report.setRecommendedAction(result.recommendedAction());
                report.setReport(buildReportSafe(report, metricSummary, result));
                report.setStatus("success");
                report.setErrorMessage(null);
                analysisReportMapper.updateById(report);
                long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
                log.info("{}={} {}={} {}={} {}={} {}={} reportId={} deviceCode={}",
                    LogFields.REQUEST_ID, safeRequestId(),
                    LogFields.MODULE, "analysis",
                    LogFields.EVENT, "analysis.create.complete",
                    LogFields.RESULT, "success",
                    LogFields.LATENCY_MS, latencyMs,
                    report.getId(),
                    deviceCode
                );
                return toDto(report);
            } catch (Exception ex) {
                attempt += 1;
                log.warn("{}={} {}={} {}={} {}={} {}={} attempt={} deviceCode={} message={}",
                    LogFields.REQUEST_ID, safeRequestId(),
                    LogFields.MODULE, "analysis",
                    LogFields.EVENT, "analysis.create.attempt_failed",
                    LogFields.RESULT, "retrying",
                    LogFields.ERROR_CODE, "LLM_ATTEMPT_FAILED",
                    attempt,
                    deviceCode,
                    ex.getMessage()
                );
                if (attempt > MAX_RETRY) {
                    return applyFallbackAndSave(report, metricSummary);
                }
            }
        }

        return applyFallbackAndSave(report, metricSummary);
    }

    private AnalysisReportDto applyFallbackAndSave(AnalysisReportEntity report, String metricSummary) {
        LlmPredictionResult fallback = llmProviderAdapter.fallback(metricSummary);
        report.setPrediction(fallback.prediction());
        report.setConfidence(fallback.confidence());
        report.setRiskLevel(fallback.riskLevel());
        report.setRecommendedAction(fallback.recommendedAction());
        report.setReport(buildReportSafe(report, metricSummary, fallback));
        report.setStatus("success");
        report.setErrorMessage(null);
        analysisReportMapper.updateById(report);
        return toDto(report);
    }

    private String buildReportSafe(AnalysisReportEntity report, String metricSummary, LlmPredictionResult result) {
        try {
            List<AnalysisRootCauseDto> rootCauses = parseRootCauses(report.getRootCausesJson());
            List<AnalysisCausalEdgeDto> causalEdges = parseCausalEdges(report.getCausalGraphJson());
            return llmProviderAdapter.generateReport(
                report.getDeviceCode(), metricSummary, rootCauses, causalEdges,
                result.prediction(), result.riskLevel(), result.recommendedAction()
            );
        } catch (Exception ex) {
            log.warn("{}={} {}={} {}={} {}={} {}={} reportId={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.report.generate_failed",
                LogFields.RESULT, "fallback",
                LogFields.ERROR_CODE, "REPORT_GENERATE_FAILED",
                report.getId(),
                ex.getMessage()
            );
            return "## 综合分析报告\n\n报告生成失败，请稍后重试。\n\n### 预测结果\n风险等级: " +
                (result.riskLevel() != null ? result.riskLevel() : "未知") +
                "\n预测结论: " + (result.prediction() != null ? result.prediction() : "无") +
                "\n建议动作: " + (result.recommendedAction() != null ? result.recommendedAction() : "无") + "\n";
        }
    }

    public List<AnalysisReportDto> listReports(int limit) {
        try {
            QueryWrapper<AnalysisReportEntity> wrapper = new QueryWrapper<>();
            wrapper.orderByDesc("created_at").last("LIMIT " + limit);
            return analysisReportMapper.selectList(wrapper).stream()
                .map(this::reconcileStaleProcessingReport)
                .map(this::toDto)
                .toList();
        } catch (org.springframework.dao.DataAccessException ex) {
            log.error("{}={} {}={} {}={} {}={} {}={} limit={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.report.list.db_error",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "DB_ACCESS_ERROR",
                limit,
                ex.getMessage(),
                ex
            );
            return List.of();
        }
    }

    public AnalysisReportDto getReport(Long id) {
        AnalysisReportEntity entity = analysisReportMapper.selectById(id);
        if (entity == null) {
            throw new NotFoundException("analysis report not found: " + id);
        }
        return toDto(reconcileStaleProcessingReport(entity));
    }

    private AnalysisReportEntity reconcileStaleProcessingReport(AnalysisReportEntity report) {
        if (report == null || !"processing".equalsIgnoreCase(report.getStatus()) || report.getCreatedAt() == null) {
            return report;
        }
        Instant createdAtInstant = report.getCreatedAt().atZone(storageZoneId).toInstant();
        Duration age = Duration.between(createdAtInstant, Instant.now(clock));
        if (age.compareTo(PROCESSING_STALE_TIMEOUT) <= 0) {
            return report;
        }
        String timeoutMessage = "analysis processing timeout: backend interrupted or consumer unavailable";
        report.setStatus("failed");
        if (report.getErrorMessage() == null || report.getErrorMessage().isBlank()) {
            report.setErrorMessage(timeoutMessage);
        }
        analysisReportMapper.updateById(report);
        log.warn("{}={} {}={} {}={} {}={} {}={} reportId={} ageMinutes={} timeoutMinutes={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.processing.reconcile",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "ANALYSIS_PROCESSING_TIMEOUT",
            report.getId(),
            age.toMinutes(),
            PROCESSING_STALE_TIMEOUT.toMinutes()
        );
        return report;
    }

    private LlmPredictionResult callWithTimeout(String deviceCode, String metricSummary) throws Exception {
        CompletableFuture<LlmPredictionResult> future = CompletableFuture.supplyAsync(() -> {
            try {
                return llmProviderAdapter.predict(deviceCode, metricSummary);
            } catch (Exception ex) {
                throw new RuntimeException(ex.getMessage(), ex);
            }
        });
        try {
            return future.get(PROVIDER_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException ex) {
            future.cancel(true);
            throw new RuntimeException("llm timeout after " + PROVIDER_TIMEOUT.toSeconds() + "s", ex);
        } catch (ExecutionException ex) {
            throw new RuntimeException(ex.getCause() == null ? ex.getMessage() : ex.getCause().getMessage(), ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("llm prediction interrupted", ex);
        }
    }

    private AnalysisReportDto toDto(AnalysisReportEntity entity) {
        LocalDateTime created = entity.getCreatedAt();
        String createdAt = formatDateTime(created);
        Double confidence = entity.getConfidence() == null ? null : entity.getConfidence().doubleValue();
        return new AnalysisReportDto(
            entity.getId(),
            entity.getDeviceCode(),
            entity.getMetricSummary(),
            entity.getPrediction(),
            confidence,
            entity.getRiskLevel(),
            entity.getRecommendedAction(),
            entity.getEngine(),
            entity.getRcaStatus(),
            parseRootCauses(entity.getRootCausesJson()),
            parseCausalEdges(entity.getCausalGraphJson()),
            entity.getModelVersion(),
            formatDateTime(entity.getEvidenceWindowStart()),
            formatDateTime(entity.getEvidenceWindowEnd()),
            entity.getStatus(),
            entity.getErrorMessage(),
            createdAt,
            entity.getReport()
        );
    }

    private void applyRcaPayload(AnalysisReportEntity report, AnalysisRcaPayload rcaPayload) {
        if (rcaPayload == null) {
            return;
        }
        report.setEngine(rcaPayload.engine());
        report.setRcaStatus(rcaPayload.rcaStatus());
        report.setRootCausesJson(rcaPayload.rootCausesJson());
        report.setCausalGraphJson(rcaPayload.causalGraphJson());
        report.setModelVersion(rcaPayload.modelVersion());
        report.setEvidenceWindowStart(rcaPayload.evidenceWindowStart());
        report.setEvidenceWindowEnd(rcaPayload.evidenceWindowEnd());
    }

    private List<AnalysisRootCauseDto> parseRootCauses(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            return List.of();
        }
        try {
            return REPORT_OBJECT_MAPPER.readValue(rawJson, new TypeReference<List<AnalysisRootCauseDto>>() {});
        } catch (Exception ex) {
            return List.of();
        }
    }

    private List<AnalysisCausalEdgeDto> parseCausalEdges(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            return List.of();
        }
        try {
            return REPORT_OBJECT_MAPPER.readValue(rawJson, new TypeReference<List<AnalysisCausalEdgeDto>>() {});
        } catch (Exception ex) {
            return List.of();
        }
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime
            .atZone(storageZoneId)
            .withZoneSameInstant(displayZoneId)
            .toLocalDateTime()
            .format(TIME_FMT);
    }

    private ZoneId parseZoneId(String rawZoneId, String property, ZoneId fallback) {
        try {
            return ZoneId.of(rawZoneId);
        } catch (DateTimeException ex) {
            log.warn("{}={} {}={} {}={} {}={} {}={} property={} configuredValue={} fallback={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.timezone.parse_failed",
                LogFields.RESULT, "fallback",
                LogFields.ERROR_CODE, "ANALYSIS_TIMEZONE_INVALID",
                property,
                rawZoneId,
                fallback.getId()
            );
            return fallback;
        }
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
