package com.twinops.backend.telemetry.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.common.dto.TelemetryPointDto;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TelemetryService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("MM-dd HH:mm");
    private final TelemetryMapper telemetryMapper;

    public TelemetryService(TelemetryMapper telemetryMapper) {
        this.telemetryMapper = telemetryMapper;
    }

    public List<TelemetryPointDto> query(String deviceCode, LocalDateTime from, LocalDateTime to, int limit) {
        QueryWrapper<TelemetryEntity> wrapper = new QueryWrapper<>();
        if (deviceCode != null && !deviceCode.isBlank()) {
            wrapper.eq("device_code", deviceCode);
        }
        if (from != null) {
            wrapper.ge("metric_time", from);
        }
        if (to != null) {
            wrapper.le("metric_time", to);
        }
        wrapper.orderByDesc("metric_time").last("LIMIT " + Math.max(1, Math.min(limit, 500)));
        return telemetryMapper.selectList(wrapper).stream().map(this::toDto).toList();
    }

    public int deleteOlderThan30Days() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        QueryWrapper<TelemetryEntity> wrapper = new QueryWrapper<>();
        wrapper.lt("metric_time", cutoff);
        return telemetryMapper.delete(wrapper);
    }

    @Scheduled(cron = "0 15 2 * * *")
    public void scheduledRetentionCleanup() {
        deleteOlderThan30Days();
    }

    private TelemetryPointDto toDto(TelemetryEntity entity) {
        String time = entity.getMetricTime() == null ? "--" : entity.getMetricTime().format(TIME_FMT);
        return new TelemetryPointDto(
            time,
            entity.getTemperature(),
            entity.getHumidity(),
            entity.getVoltage(),
            entity.getCurrent(),
            entity.getPower(),
            entity.getCpuLoad(),
            entity.getMemoryUsage(),
            entity.getDiskUsage(),
            entity.getNetworkTraffic()
        );
    }
}
