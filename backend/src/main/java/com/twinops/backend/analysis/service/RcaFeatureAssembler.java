package com.twinops.backend.analysis.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.analysis.dto.RcaInferenceDeviceDto;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class RcaFeatureAssembler {

    private static final int WINDOW_POINTS = 30;
    private static final int MAX_DEVICES = 10;

    private final TelemetryMapper telemetryMapper;

    public RcaFeatureAssembler(TelemetryMapper telemetryMapper) {
        this.telemetryMapper = telemetryMapper;
    }

    public Optional<DeviceRcaFeatureWindow> buildWindow(String requestId, List<DeviceEntity> targets) {
        List<DeviceEntity> selected = targets.stream()
            .sorted(Comparator.comparingInt(this::devicePriority).thenComparing(DeviceEntity::getDeviceCode))
            .limit(MAX_DEVICES)
            .toList();
        if (selected.isEmpty()) {
            return Optional.empty();
        }

        List<DeviceSeries> seriesByDevice = new ArrayList<>();
        LocalDateTime windowStart = null;
        LocalDateTime windowEnd = null;

        for (DeviceEntity device : selected) {
            List<TelemetryEntity> metrics = latestMetrics(device.getDeviceCode());
            if (metrics.isEmpty()) {
                continue;
            }
            metrics = metrics.stream()
                .sorted(Comparator.comparing(TelemetryEntity::getMetricTime))
                .toList();
            List<Double> stressSeries = stressSeries(metrics);
            if (stressSeries.isEmpty()) {
                continue;
            }
            stressSeries = leftPad(stressSeries, WINDOW_POINTS);
            LocalDateTime deviceStart = metrics.get(Math.max(0, metrics.size() - WINDOW_POINTS)).getMetricTime();
            LocalDateTime deviceEnd = metrics.get(metrics.size() - 1).getMetricTime();
            windowStart = windowStart == null || deviceStart.isBefore(windowStart) ? deviceStart : windowStart;
            windowEnd = windowEnd == null || deviceEnd.isAfter(windowEnd) ? deviceEnd : windowEnd;
            seriesByDevice.add(new DeviceSeries(
                new RcaInferenceDeviceDto(device.getDeviceCode(), device.getStatus()),
                stressSeries
            ));
        }

        if (seriesByDevice.isEmpty() || windowStart == null || windowEnd == null) {
            return Optional.empty();
        }

        List<RcaInferenceDeviceDto> devices = seriesByDevice.stream().map(DeviceSeries::device).toList();
        List<List<Double>> matrix = transpose(seriesByDevice.stream().map(DeviceSeries::stressSeries).toList());
        return Optional.of(new DeviceRcaFeatureWindow(
            requestId,
            windowStart,
            windowEnd,
            1,
            devices,
            matrix
        ));
    }

    private List<TelemetryEntity> latestMetrics(String deviceCode) {
        QueryWrapper<TelemetryEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("device_code", deviceCode).orderByDesc("metric_time").last("LIMIT " + WINDOW_POINTS);
        return telemetryMapper.selectList(wrapper);
    }

    private List<Double> stressSeries(List<TelemetryEntity> metrics) {
        List<Double> temperature = metrics.stream().map(item -> numeric(item.getTemperature())).toList();
        List<Double> power = metrics.stream().map(item -> numeric(item.getPower())).toList();
        List<Double> cpu = metrics.stream().map(item -> numeric(item.getCpuLoad())).toList();
        List<Double> memory = metrics.stream().map(item -> numeric(item.getMemoryUsage())).toList();
        List<Double> disk = metrics.stream().map(item -> numeric(item.getDiskUsage())).toList();
        List<Double> network = metrics.stream().map(item -> numeric(item.getNetworkTraffic())).toList();

        List<Double> result = new ArrayList<>();
        for (int index = 0; index < metrics.size(); index++) {
            double stress =
                0.20 * positiveZ(temperature, index) +
                0.22 * positiveZ(power, index) +
                0.18 * positiveZ(cpu, index) +
                0.16 * positiveZ(memory, index) +
                0.12 * positiveZ(disk, index) +
                0.12 * positiveZ(network, index);
            result.add(stress);
        }
        return result;
    }

    private List<Double> leftPad(List<Double> values, int size) {
        if (values.size() >= size) {
            return values.subList(values.size() - size, values.size());
        }
        double fill = values.isEmpty() ? 0.0 : values.get(0);
        List<Double> padded = new ArrayList<>();
        for (int index = values.size(); index < size; index++) {
            padded.add(fill);
        }
        padded.addAll(values);
        return padded;
    }

    private List<List<Double>> transpose(List<List<Double>> byDevice) {
        int points = byDevice.get(0).size();
        List<List<Double>> result = new ArrayList<>();
        for (int point = 0; point < points; point++) {
            List<Double> row = new ArrayList<>();
            for (List<Double> deviceSeries : byDevice) {
                row.add(deviceSeries.get(point));
            }
            result.add(row);
        }
        return result;
    }

    private int devicePriority(DeviceEntity device) {
        return "error".equalsIgnoreCase(device.getStatus()) ? 0 : 1;
    }

    private double positiveZ(List<Double> values, int index) {
        if (values.isEmpty()) {
            return 0.0;
        }
        double mean = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = values.stream()
            .mapToDouble(value -> Math.pow(value - mean, 2))
            .average()
            .orElse(0.0);
        double std = Math.sqrt(variance);
        if (std < 1e-6) {
            std = Math.max(1.0, Math.abs(mean) * 0.05);
        }
        double z = (values.get(index) - mean) / std;
        return Math.max(z, 0.0);
    }

    private double numeric(BigDecimal value) {
        return value == null ? 0.0 : value.doubleValue();
    }

    private record DeviceSeries(RcaInferenceDeviceDto device, List<Double> stressSeries) {
    }
}
