package com.twinops.backend.analysis.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.entity.AnalysisReportEntity;
import com.twinops.backend.analysis.mapper.AnalysisReportMapper;
import com.twinops.backend.common.exception.NotFoundException;
import com.twinops.backend.common.logging.LogFields;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
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
    private static final Duration PROVIDER_TIMEOUT = Duration.ofSeconds(5);
    private static final int MAX_RETRY = 2;

    private final AnalysisReportMapper analysisReportMapper;
    private final LlmProviderAdapter llmProviderAdapter;

    public AnalysisService(AnalysisReportMapper analysisReportMapper, LlmProviderAdapter llmProviderAdapter) {
        this.analysisReportMapper = analysisReportMapper;
        this.llmProviderAdapter = llmProviderAdapter;
    }

    public AnalysisReportDto createReport(String deviceCode, String metricSummary) {
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
        report.setStatus("processing");
        analysisReportMapper.insert(report);

        int attempt = 0;
        while (attempt <= MAX_RETRY) {
            try {
                LlmPredictionResult result = callWithTimeout(deviceCode, metricSummary);
                report.setPrediction(result.prediction());
                report.setConfidence(result.confidence());
                report.setRiskLevel(result.riskLevel());
                report.setRecommendedAction(result.recommendedAction());
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
                    report.setStatus("failed");
                    report.setErrorMessage(ex.getMessage());
                    analysisReportMapper.updateById(report);
                    long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
                    log.error("{}={} {}={} {}={} {}={} {}={} {}={} reportId={} deviceCode={} message={}",
                        LogFields.REQUEST_ID, safeRequestId(),
                        LogFields.MODULE, "analysis",
                        LogFields.EVENT, "analysis.create.complete",
                        LogFields.RESULT, "failed",
                        LogFields.ERROR_CODE, "LLM_FINAL_FAILURE",
                        LogFields.LATENCY_MS, latencyMs,
                        report.getId(),
                        deviceCode,
                        ex.getMessage(),
                        ex
                    );
                    return toDto(report);
                }
            }
        }

        report.setStatus("failed");
        report.setErrorMessage("analysis failed");
        analysisReportMapper.updateById(report);
        long latencyMs = (System.nanoTime() - startNanos) / 1_000_000;
        log.error("{}={} {}={} {}={} {}={} {}={} {}={} reportId={} deviceCode={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.create.complete",
            LogFields.RESULT, "failed",
            LogFields.ERROR_CODE, "ANALYSIS_UNKNOWN_FAILURE",
            LogFields.LATENCY_MS, latencyMs,
            report.getId(),
            deviceCode
        );
        return toDto(report);
    }

    public List<AnalysisReportDto> listReports(int limit) {
        QueryWrapper<AnalysisReportEntity> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("created_at").last("LIMIT " + limit);
        return analysisReportMapper.selectList(wrapper).stream().map(this::toDto).toList();
    }

    public AnalysisReportDto getReport(Long id) {
        AnalysisReportEntity entity = analysisReportMapper.selectById(id);
        if (entity == null) {
            throw new NotFoundException("analysis report not found: " + id);
        }
        return toDto(entity);
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
        String createdAt = created == null ? "--" : created.format(TIME_FMT);
        Double confidence = entity.getConfidence() == null ? null : entity.getConfidence().doubleValue();
        return new AnalysisReportDto(
            entity.getId(),
            entity.getDeviceCode(),
            entity.getMetricSummary(),
            entity.getPrediction(),
            confidence,
            entity.getRiskLevel(),
            entity.getRecommendedAction(),
            entity.getStatus(),
            entity.getErrorMessage(),
            createdAt
        );
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
