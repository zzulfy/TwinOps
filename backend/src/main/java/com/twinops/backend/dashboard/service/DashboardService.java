package com.twinops.backend.dashboard.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.AlarmItemDto;
import com.twinops.backend.common.dto.ChartSeriesDto;
import com.twinops.backend.common.dto.DashboardSummaryDto;
import com.twinops.backend.common.dto.DeviceScaleItemDto;
import com.twinops.backend.common.dto.FaultRateTrendDto;
import com.twinops.backend.common.dto.FaultRateTrendPointDto;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.analysis.service.LlmPredictionResult;
import com.twinops.backend.analysis.service.LlmProviderAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter TREND_TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private final DeviceMapper deviceMapper;
    private final AlarmMapper alarmMapper;
    private final TelemetryMapper telemetryMapper;
    private final LlmProviderAdapter llmProviderAdapter;

    public DashboardService(
        DeviceMapper deviceMapper,
        AlarmMapper alarmMapper,
        TelemetryMapper telemetryMapper,
        LlmProviderAdapter llmProviderAdapter
    ) {
        this.deviceMapper = deviceMapper;
        this.alarmMapper = alarmMapper;
        this.telemetryMapper = telemetryMapper;
        this.llmProviderAdapter = llmProviderAdapter;
    }

    public DashboardSummaryDto summary() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "dashboard",
            LogFields.EVENT, "dashboard.service.summary",
            LogFields.RESULT, "started"
        );
        return new DashboardSummaryDto(deviceScale(), recentAlarms(), faultRateSeries(), resourceUsageSeries());
    }

    public FaultRateTrendDto faultRateTrend(LocalDateTime from, LocalDateTime to, int predictMinutes) {
        LocalDateTime end = (to == null ? LocalDateTime.now() : to).truncatedTo(ChronoUnit.MINUTES);
        LocalDateTime start = (from == null ? end.minusMinutes(180) : from).truncatedTo(ChronoUnit.MINUTES);
        if (start.isAfter(end)) {
            start = end.minusMinutes(60);
        }
        int boundedPredictMinutes = Math.max(1, Math.min(predictMinutes, 5));
        List<FaultRateTrendPointDto> history = buildHistorySeries(start, end);
        List<FaultRateTrendPointDto> forecast = buildForecastSeries(history, end, boundedPredictMinutes);
        return new FaultRateTrendDto(history, forecast, "minute", 1);
    }

    private List<DeviceScaleItemDto> deviceScale() {
        List<DeviceEntity> devices = deviceMapper.selectList(new QueryWrapper<>());
        if (devices.isEmpty()) {
            log.warn("{}={} {}={} {}={} {}={} {}={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "dashboard",
                LogFields.EVENT, "dashboard.service.device_scale",
                LogFields.RESULT, "empty",
                LogFields.ERROR_CODE, "DEVICE_LIST_EMPTY"
            );
        }
        Map<String, Long> grouped = devices.stream().collect(Collectors.groupingBy(DeviceEntity::getType, Collectors.counting()));
        List<DeviceScaleItemDto> items = new ArrayList<>();
        grouped.forEach((type, count) -> items.add(new DeviceScaleItemDto(iconByType(type), type, String.valueOf(count), "个")));
        return items;
    }

    private List<AlarmItemDto> recentAlarms() {
        QueryWrapper<AlarmEntity> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("occurred_at").last("LIMIT 12");
        return alarmMapper.selectList(wrapper).stream().map(a -> new AlarmItemDto(
            a.getId(),
            a.getDeviceName(),
            a.getEvent(),
            a.getLevel(),
            a.getOccurredAt() == null ? "--:--" : a.getOccurredAt().format(TIME_FMT),
            a.getStatus()
        )).toList();
    }

    private ChartSeriesDto faultRateSeries() {
        QueryWrapper<TelemetryEntity> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("metric_time").last("LIMIT 500");
        List<TelemetryEntity> metrics = telemetryMapper.selectList(wrapper);
        BigDecimal faultRate = currentFaultRateRatio();
        Map<LocalDateTime, List<Double>> bucketValues = new TreeMap<>();
        for (TelemetryEntity metric : metrics) {
            if (metric.getMetricTime() == null) {
                continue;
            }
            LocalDateTime bucket = metric.getMetricTime().truncatedTo(ChronoUnit.HOURS);
            bucketValues.computeIfAbsent(bucket, k -> new ArrayList<>()).add(faultRate.doubleValue());
        }
        List<String> labels = new ArrayList<>();
        List<Double> values = new ArrayList<>();
        for (Map.Entry<LocalDateTime, List<Double>> entry : bucketValues.entrySet()) {
            labels.add(entry.getKey().format(TIME_FMT));
            double sum = entry.getValue().stream().mapToDouble(Double::doubleValue).sum();
            double avg = sum / entry.getValue().size();
            values.add(Math.round(avg * 10D) / 10D);
        }
        return new ChartSeriesDto(labels, values);
    }

    private ChartSeriesDto resourceUsageSeries() {
        QueryWrapper<TelemetryEntity> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("metric_time").last("LIMIT 30");
        List<TelemetryEntity> metrics = telemetryMapper.selectList(wrapper);
        List<String> labels = new ArrayList<>();
        List<Double> values = new ArrayList<>();
        for (int i = metrics.size() - 1; i >= 0; i--) {
            TelemetryEntity m = metrics.get(i);
            labels.add(m.getMetricTime() == null ? "--" : m.getMetricTime().format(TIME_FMT));
            values.add(m.getCpuLoad() == null ? 0D : m.getCpuLoad().doubleValue());
        }
        return new ChartSeriesDto(labels, values);
    }

    private List<FaultRateTrendPointDto> buildHistorySeries(LocalDateTime start, LocalDateTime end) {
        BigDecimal faultRate = currentFaultRateRatio();
        List<FaultRateTrendPointDto> history = new ArrayList<>();
        for (LocalDateTime cursor = start; !cursor.isAfter(end); cursor = cursor.plusMinutes(1)) {
            history.add(new FaultRateTrendPointDto(
                cursor.format(TREND_TIME_FMT),
                faultRate.doubleValue(),
                false,
                null
            ));
        }
        return history;
    }

    private List<FaultRateTrendPointDto> buildForecastSeries(
        List<FaultRateTrendPointDto> history,
        LocalDateTime end,
        int predictMinutes
    ) {
        if (history.isEmpty()) {
            return List.of();
        }
        List<BigDecimal> historicalValues = history.stream()
            .map(item -> BigDecimal.valueOf(item.value()))
            .toList();
        List<BigDecimal> statisticalForecast = forecastFromTrend(historicalValues, predictMinutes);
        AIForecastProfile profile = aiForecastProfile(historicalValues, statisticalForecast);
        List<FaultRateTrendPointDto> forecast = new ArrayList<>();
        for (int index = 0; index < statisticalForecast.size(); index++) {
            BigDecimal adjusted = statisticalForecast.get(index)
                .multiply(profile.adjustmentFactor())
                .setScale(1, RoundingMode.HALF_UP);
            BigDecimal bounded = scaleOne(adjusted.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100)));
            LocalDateTime pointTime = end.plusMinutes(index + 1L);
            forecast.add(new FaultRateTrendPointDto(
                pointTime.format(TREND_TIME_FMT),
                bounded.doubleValue(),
                true,
                profile.confidence().doubleValue()
            ));
        }
        return forecast;
    }

    private List<BigDecimal> forecastFromTrend(List<BigDecimal> historicalValues, int predictMinutes) {
        int windowSize = Math.min(10, historicalValues.size());
        List<BigDecimal> window = historicalValues.subList(historicalValues.size() - windowSize, historicalValues.size());
        BigDecimal first = window.get(0);
        BigDecimal last = window.get(window.size() - 1);
        BigDecimal slope = window.size() == 1
            ? BigDecimal.ZERO
            : last.subtract(first).divide(BigDecimal.valueOf(window.size() - 1L), 4, RoundingMode.HALF_UP);
        BigDecimal deltaSum = BigDecimal.ZERO;
        for (int i = 1; i < window.size(); i++) {
            deltaSum = deltaSum.add(window.get(i).subtract(window.get(i - 1)));
        }
        BigDecimal avgDelta = window.size() == 1
            ? BigDecimal.ZERO
            : deltaSum.divide(BigDecimal.valueOf(window.size() - 1L), 4, RoundingMode.HALF_UP);
        BigDecimal baselineStep = slope.multiply(BigDecimal.valueOf(0.6))
            .add(avgDelta.multiply(BigDecimal.valueOf(0.4)));
        List<BigDecimal> forecast = new ArrayList<>();
        BigDecimal base = historicalValues.get(historicalValues.size() - 1);
        for (int i = 1; i <= predictMinutes; i++) {
            BigDecimal point = base.add(baselineStep.multiply(BigDecimal.valueOf(i)));
            forecast.add(scaleOne(point.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100))));
        }
        return forecast;
    }

    private AIForecastProfile aiForecastProfile(List<BigDecimal> history, List<BigDecimal> forecast) {
        BigDecimal rawConfidence = BigDecimal.valueOf(70);
        String riskLevel = "medium";
        try {
            BigDecimal last = history.get(history.size() - 1);
            BigDecimal avg = history.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(history.size()), 4, RoundingMode.HALF_UP);
            String metricSummary = "minute_fault_rate_history=" + history
                + ";statistical_forecast_next_5m=" + forecast
                + ";latest=" + last
                + ";avg=" + avg;
            LlmPredictionResult prediction = llmProviderAdapter.predict("dashboard-fault-rate", metricSummary);
            riskLevel = prediction.riskLevel();
            if (prediction.confidence() != null) {
                rawConfidence = prediction.confidence();
            }
        } catch (Exception ex) {
            log.warn("{}={} {}={} {}={} {}={} {}={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "dashboard",
                LogFields.EVENT, "dashboard.fault_rate.ai_profile",
                LogFields.RESULT, "fallback",
                LogFields.ERROR_CODE, "FAULT_RATE_AI_FALLBACK",
                ex.getMessage()
            );
        }
        BigDecimal confidencePercent = rawConfidence;
        if (confidencePercent.compareTo(BigDecimal.ONE) <= 0) {
            confidencePercent = confidencePercent.multiply(BigDecimal.valueOf(100));
        }
        confidencePercent = confidencePercent.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100));
        BigDecimal normalized = confidencePercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        int direction = switch (riskLevel == null ? "" : riskLevel.toLowerCase()) {
            case "high" -> 1;
            case "low" -> -1;
            default -> 0;
        };
        BigDecimal adjustment = BigDecimal.valueOf(direction).multiply(normalized).multiply(BigDecimal.valueOf(0.12));
        BigDecimal factor = BigDecimal.ONE.add(adjustment);
        return new AIForecastProfile(scaleOne(confidencePercent), factor);
    }

    private BigDecimal currentFaultRateRatio() {
        List<DeviceEntity> devices = deviceMapper.selectList(new QueryWrapper<>());
        if (devices.isEmpty()) {
            return BigDecimal.ZERO;
        }
        long errorCount = devices.stream()
            .map(DeviceEntity::getStatus)
            .filter(this::isErrorStatus)
            .count();
        BigDecimal ratio = BigDecimal.valueOf(errorCount)
            .multiply(BigDecimal.valueOf(100))
            .divide(BigDecimal.valueOf(devices.size()), 4, RoundingMode.HALF_UP);
        return scaleOne(ratio);
    }

    private boolean isErrorStatus(String status) {
        return "error".equalsIgnoreCase(status == null ? "" : status.trim());
    }

    private BigDecimal scaleOne(BigDecimal input) {
        return input.setScale(1, RoundingMode.HALF_UP);
    }

    private record AIForecastProfile(BigDecimal confidence, BigDecimal adjustmentFactor) {
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }

    private String iconByType(String type) {
        if (type == null) {
            return "fa-solid fa-server";
        }
        return switch (type) {
            case "网络设备" -> "fa-solid fa-network-wired";
            case "电源柜" -> "fa-solid fa-bolt";
            case "温湿度传感器" -> "fa-solid fa-temperature-three-quarters";
            case "空调系统" -> "fa-solid fa-snowflake";
            case "防火墙" -> "fa-solid fa-shield-alt";
            case "交换机" -> "fa-solid fa-ethernet";
            case "存储设备" -> "fa-solid fa-database";
            case "监控设备" -> "fa-solid fa-video";
            default -> "fa-solid fa-server";
        };
    }
}
