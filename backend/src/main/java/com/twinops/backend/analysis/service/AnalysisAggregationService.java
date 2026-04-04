package com.twinops.backend.analysis.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
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

    public AnalysisAggregationService(
        DeviceMapper deviceMapper,
        TelemetryMapper telemetryMapper,
        AnalysisService analysisService
    ) {
        this.deviceMapper = deviceMapper;
        this.telemetryMapper = telemetryMapper;
        this.analysisService = analysisService;
    }

    public void processAggregatedBatch(String slot, String idempotencyKey) {
        QueryWrapper<DeviceEntity> deviceQuery = new QueryWrapper<>();
        deviceQuery.in("status", List.of("warning", "error"));
        deviceQuery.orderByAsc("device_code");
        List<DeviceEntity> targets = deviceMapper.selectList(deviceQuery);
        if (targets.isEmpty()) {
            throw new RuntimeException("no warning/error devices found for aggregated analysis slot=" + slot);
        }

        String metricSummary = buildAggregatedMetricSummary(slot, targets);
        log.info("{}={} {}={} {}={} {}={} slot={} idempotencyKey={} targetCount={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.automation.aggregate",
            LogFields.RESULT, "started",
            slot,
            idempotencyKey,
            targets.size()
        );
        analysisService.createReportWithIdempotency(AGGREGATED_DEVICE_CODE, metricSummary, idempotencyKey);
    }

    private String buildAggregatedMetricSummary(String slot, List<DeviceEntity> targets) {
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
        return "auto-analysis slot=%s mode=aggregated targetCount=%d devices=[%s]".formatted(
            slot,
            targets.size(),
            String.join(" | ", rows)
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
