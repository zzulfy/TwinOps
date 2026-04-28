package com.twinops.backend.analysis.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.analysis.dto.AnalysisCausalEdgeDto;
import com.twinops.backend.analysis.dto.AnalysisRootCauseDto;
import com.twinops.backend.analysis.dto.RcaInferenceResponseDto;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnalysisAggregationService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisAggregationService.class);
    private static final String AGGREGATED_DEVICE_CODE = "AGGREGATED";

    private final DeviceMapper deviceMapper;
    private final TelemetryMapper telemetryMapper;
    private final AnalysisService analysisService;
    private final RcaFeatureAssembler rcaFeatureAssembler;
    private final RcaEngineClient rcaEngineClient;
    private final ObjectMapper objectMapper;

    public AnalysisAggregationService(
        DeviceMapper deviceMapper,
        TelemetryMapper telemetryMapper,
        AnalysisService analysisService,
        RcaFeatureAssembler rcaFeatureAssembler,
        RcaEngineClient rcaEngineClient
    ) {
        this.deviceMapper = deviceMapper;
        this.telemetryMapper = telemetryMapper;
        this.analysisService = analysisService;
        this.rcaFeatureAssembler = rcaFeatureAssembler;
        this.rcaEngineClient = rcaEngineClient;
        this.objectMapper = new ObjectMapper();
    }

    public void processAggregatedBatch(String slot, String idempotencyKey) {
        QueryWrapper<DeviceEntity> deviceQuery = new QueryWrapper<>();
        deviceQuery.in("status", List.of("warning", "error"));
        deviceQuery.orderByAsc("device_code");
        List<DeviceEntity> targets = deviceMapper.selectList(deviceQuery);
        if (targets.isEmpty()) {
            log.warn("{}={} {}={} {}={} {}={} {}={} slot={} idempotencyKey={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.aggregate",
                LogFields.RESULT, "empty",
                LogFields.ERROR_CODE, "ANALYSIS_TARGET_EMPTY",
                slot,
                idempotencyKey
            );
            throw new RuntimeException("no warning/error devices found for aggregated analysis slot=" + slot);
        }

        AnalysisRcaPayload rcaPayload = buildRcaPayload(slot, targets);
        String metricSummary = buildAggregatedMetricSummary(slot, targets, rcaPayload);
        log.info("{}={} {}={} {}={} {}={} slot={} idempotencyKey={} targetCount={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.automation.aggregate",
            LogFields.RESULT, "started",
            slot,
            idempotencyKey,
            targets.size()
        );
        analysisService.createReportWithIdempotency(AGGREGATED_DEVICE_CODE, metricSummary, idempotencyKey, rcaPayload);
        log.info("{}={} {}={} {}={} {}={} slot={} idempotencyKey={} targetCount={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.automation.aggregate",
            LogFields.RESULT, "success",
            slot,
            idempotencyKey,
            targets.size()
        );
    }

    private AnalysisRcaPayload buildRcaPayload(String slot, List<DeviceEntity> targets) {
        return rcaFeatureAssembler.buildWindow(slot, targets)
            .map(window -> {
                try {
                    return rcaEngineClient.infer(window)
                        .map(response -> AnalysisRcaPayload.success(response, window.windowStart(), window.windowEnd(), objectMapper))
                        .orElseGet(() -> AnalysisRcaPayload.fallback(window.windowStart(), window.windowEnd()));
                } catch (Exception ex) {
                    log.warn("{}={} {}={} {}={} {}={} {}={} slot={} message={}",
                        LogFields.REQUEST_ID, safeRequestId(),
                        LogFields.MODULE, "analysis",
                        LogFields.EVENT, "analysis.automation.rca",
                        LogFields.RESULT, "fallback",
                        LogFields.ERROR_CODE, "ANALYSIS_RCA_FALLBACK",
                        slot,
                        ex.getMessage()
                    );
                    return AnalysisRcaPayload.fallback(window.windowStart(), window.windowEnd());
                }
            })
            .orElseGet(() -> AnalysisRcaPayload.fallback(null, null));
    }

    private String buildAggregatedMetricSummary(String slot, List<DeviceEntity> targets, AnalysisRcaPayload rcaPayload) {
        List<String> rows = new ArrayList<>();
        for (DeviceEntity device : targets) {
            QueryWrapper<TelemetryEntity> metricQuery = new QueryWrapper<>();
            metricQuery.eq("device_code", device.getDeviceCode()).orderByDesc("metric_time").last("LIMIT 1");
            TelemetryEntity metric = telemetryMapper.selectOne(metricQuery);
            rows.add("deviceCode=%s,status=%s,location=%s,cpuLoad=%s,temperature=%s,memoryUsage=%s,diskUsage=%s,networkTraffic=%s".formatted(
                device.getDeviceCode(),
                nullSafe(device.getStatus()),
                nullSafe(device.getLocation()),
                decimal(metric == null ? null : metric.getCpuLoad()),
                decimal(metric == null ? null : metric.getTemperature()),
                decimal(metric == null ? null : metric.getMemoryUsage()),
                decimal(metric == null ? null : metric.getDiskUsage()),
                decimal(metric == null ? null : metric.getNetworkTraffic())
            ));
        }
        return "auto-analysis slot=%s mode=aggregated targetCount=%d devices=[%s] rca=[%s]".formatted(
            slot,
            targets.size(),
            String.join(" | ", rows),
            buildRcaSummary(rcaPayload)
        );
    }

    private String buildRcaSummary(AnalysisRcaPayload rcaPayload) {
        List<AnalysisRootCauseDto> rootCauses = rcaPayload.safeRootCauses();
        List<AnalysisCausalEdgeDto> causalEdges = rcaPayload.safeCausalEdges();
        String rootCauseText = rootCauses.isEmpty()
            ? "none"
            : rootCauses.stream()
                .limit(3)
                .map(item -> "%s:%.2f".formatted(item.deviceCode(), item.score() == null ? 0.0 : item.score()))
                .reduce((left, right) -> left + "," + right)
                .orElse("none");
        String edgeText = causalEdges.isEmpty()
            ? "none"
            : causalEdges.stream()
                .limit(3)
                .map(item -> "%s->%s:%.2f".formatted(
                    item.fromDeviceCode(),
                    item.toDeviceCode(),
                    item.weight() == null ? 0.0 : item.weight()
                ))
                .reduce((left, right) -> left + "," + right)
                .orElse("none");
        return "engine=%s,status=%s,model=%s,rootCauses=%s,edges=%s".formatted(
            nullSafe(rcaPayload.engine()),
            nullSafe(rcaPayload.rcaStatus()),
            nullSafe(rcaPayload.modelVersion()),
            rootCauseText,
            edgeText
        );
    }

    private String decimal(java.math.BigDecimal value) {
        return value == null ? "n/a" : value.toPlainString();
    }

    private String nullSafe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
