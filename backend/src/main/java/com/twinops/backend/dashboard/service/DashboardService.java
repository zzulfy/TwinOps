package com.twinops.backend.dashboard.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.AlarmItemDto;
import com.twinops.backend.common.dto.ChartSeriesDto;
import com.twinops.backend.common.dto.DashboardSummaryDto;
import com.twinops.backend.common.dto.DeviceScaleItemDto;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.springframework.stereotype.Service;

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

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private final DeviceMapper deviceMapper;
    private final AlarmMapper alarmMapper;
    private final TelemetryMapper telemetryMapper;

    public DashboardService(DeviceMapper deviceMapper, AlarmMapper alarmMapper, TelemetryMapper telemetryMapper) {
        this.deviceMapper = deviceMapper;
        this.alarmMapper = alarmMapper;
        this.telemetryMapper = telemetryMapper;
    }

    public DashboardSummaryDto summary() {
        return new DashboardSummaryDto(deviceScale(), recentAlarms(), faultRateSeries(), resourceUsageSeries());
    }

    private List<DeviceScaleItemDto> deviceScale() {
        List<DeviceEntity> devices = deviceMapper.selectList(new QueryWrapper<>());
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
        Map<LocalDateTime, List<Double>> bucketValues = new TreeMap<>();
        for (TelemetryEntity metric : metrics) {
            if (metric.getMetricTime() == null) {
                continue;
            }
            LocalDateTime bucket = metric.getMetricTime().truncatedTo(ChronoUnit.HOURS);
            double value = metric.getCpuLoad() == null
                ? 0D
                : Math.min(100D, Math.max(0D, metric.getCpuLoad().doubleValue() * 0.35));
            bucketValues.computeIfAbsent(bucket, k -> new ArrayList<>()).add(value);
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
