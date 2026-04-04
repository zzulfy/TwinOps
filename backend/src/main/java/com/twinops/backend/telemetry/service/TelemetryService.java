package com.twinops.backend.telemetry.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.common.dto.TelemetryPointDto;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TelemetryService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("MM-dd HH:mm");
    private final TelemetryMapper telemetryMapper;

    public TelemetryService(TelemetryMapper telemetryMapper) {
        this.telemetryMapper = telemetryMapper;
    }

    public List<TelemetryPointDto> query(String deviceCode, LocalDateTime from, LocalDateTime to, int limit) {
        int boundedLimit = Math.max(1, Math.min(limit, 500));
        if (limit != boundedLimit) {
            log.warn("{}={} {}={} {}={} {}={} {}={} inputLimit={} boundedLimit={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "telemetry",
                LogFields.EVENT, "telemetry.service.query",
                LogFields.RESULT, "adjusted",
                LogFields.ERROR_CODE, "TELEMETRY_LIMIT_BOUNDED",
                limit,
                boundedLimit
            );
        }
        log.info("{}={} {}={} {}={} {}={} deviceCode={} limit={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "telemetry",
            LogFields.EVENT, "telemetry.service.query",
            LogFields.RESULT, "started",
            deviceCode == null || deviceCode.isBlank() ? "-" : deviceCode,
            boundedLimit
        );
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
        wrapper.orderByDesc("metric_time").last("LIMIT " + boundedLimit);
        return telemetryMapper.selectList(wrapper).stream().map(this::toDto).toList();
    }

    public int deleteOlderThan30Days() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        QueryWrapper<TelemetryEntity> wrapper = new QueryWrapper<>();
        wrapper.lt("metric_time", cutoff);
        int deleted = telemetryMapper.delete(wrapper);
        log.info("{}={} {}={} {}={} {}={} deleted={} cutoff={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "telemetry",
            LogFields.EVENT, "telemetry.service.cleanup",
            LogFields.RESULT, "success",
            deleted,
            cutoff
        );
        return deleted;
    }

    @Scheduled(cron = "0 15 2 * * *")
    public void scheduledRetentionCleanup() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "telemetry",
            LogFields.EVENT, "telemetry.service.cleanup.scheduled",
            LogFields.RESULT, "started"
        );
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

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
