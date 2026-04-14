package com.twinops.backend.device.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.DeviceAlarmDto;
import com.twinops.backend.common.dto.DeviceDetailDto;
import com.twinops.backend.common.dto.SimulationDeviceDataDto;
import com.twinops.backend.common.exception.NotFoundException;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import com.twinops.backend.telemetry.entity.TelemetryEntity;
import com.twinops.backend.telemetry.mapper.TelemetryMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DeviceService {

    private static final Logger log = LoggerFactory.getLogger(DeviceService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private final DeviceMapper deviceMapper;
    private final TelemetryMapper telemetryMapper;
    private final AlarmMapper alarmMapper;

    public DeviceService(DeviceMapper deviceMapper, TelemetryMapper telemetryMapper, AlarmMapper alarmMapper) {
        this.deviceMapper = deviceMapper;
        this.telemetryMapper = telemetryMapper;
        this.alarmMapper = alarmMapper;
    }

    public List<DeviceDetailDto> list() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "device",
            LogFields.EVENT, "device.service.list",
            LogFields.RESULT, "started"
        );
        QueryWrapper<DeviceEntity> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("device_code");
        List<DeviceEntity> entities = deviceMapper.selectList(wrapper);
        if (entities.isEmpty()) {
            log.warn("{}={} {}={} {}={} {}={} {}={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.service.list",
                LogFields.RESULT, "empty",
                LogFields.ERROR_CODE, "DEVICE_LIST_EMPTY"
            );
        }
        warnInvalidLabelKeys(entities);
        return entities.stream().map(this::toDetail).toList();
    }

    public List<SimulationDeviceDataDto> listSimulationData() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "device",
            LogFields.EVENT, "device.service.simulation_data.list",
            LogFields.RESULT, "started"
        );
        QueryWrapper<DeviceEntity> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("device_code");
        List<DeviceEntity> entities = deviceMapper.selectList(wrapper);
        if (entities.isEmpty()) {
            log.warn("{}={} {}={} {}={} {}={} {}={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.service.simulation_data.list",
                LogFields.RESULT, "empty",
                LogFields.ERROR_CODE, "SIMULATION_DEVICE_LIST_EMPTY"
            );
        }
        return entities.stream().map(this::toSimulationData).toList();
    }

    public DeviceDetailDto getByDeviceCode(String deviceCode) {
        log.info("{}={} {}={} {}={} {}={} deviceCode={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "device",
            LogFields.EVENT, "device.service.detail",
            LogFields.RESULT, "started",
            deviceCode
        );
        QueryWrapper<DeviceEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("device_code", deviceCode).last("LIMIT 1");
        DeviceEntity entity = deviceMapper.selectOne(wrapper);
        if (entity == null) {
            log.error("{}={} {}={} {}={} {}={} {}={} deviceCode={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.service.detail",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "DEVICE_NOT_FOUND",
                deviceCode
            );
            throw new NotFoundException("device not found: " + deviceCode);
        }
        return toDetail(entity);
    }

    private DeviceDetailDto toDetail(DeviceEntity device) {
        TelemetryEntity metric = latestMetric(device.getDeviceCode());
        List<DeviceAlarmDto> alarms = recentDeviceAlarms(device.getDeviceCode());
        return new DeviceDetailDto(
            device.getDeviceCode(),
            device.getLabelKey(),
            device.getName(),
            device.getType(),
            normalizeStatus(device.getStatus()),
            device.getSerialNumber(),
            device.getLocation(),
            decimal(metric, "temperature"),
            decimal(metric, "humidity"),
            decimal(metric, "voltage"),
            decimal(metric, "current"),
            decimal(metric, "power"),
            decimal(metric, "cpuLoad"),
            decimal(metric, "memoryUsage"),
            decimal(metric, "diskUsage"),
            decimal(metric, "networkTraffic"),
            alarms
        );
    }

    private SimulationDeviceDataDto toSimulationData(DeviceEntity device) {
        TelemetryEntity metric = latestMetric(device.getDeviceCode());
        List<DeviceAlarmDto> alarms = recentDeviceAlarms(device.getDeviceCode());
        return new SimulationDeviceDataDto(
            device.getDeviceCode(),
            device.getType(),
            normalizeStatus(device.getStatus()),
            device.getSerialNumber(),
            device.getLocation(),
            decimal(metric, "temperature"),
            decimal(metric, "humidity"),
            decimal(metric, "voltage"),
            decimal(metric, "current"),
            decimal(metric, "power"),
            decimal(metric, "cpuLoad"),
            decimal(metric, "memoryUsage"),
            decimal(metric, "diskUsage"),
            decimal(metric, "networkTraffic"),
            alarms
        );
    }

    private void warnInvalidLabelKeys(List<DeviceEntity> entities) {
        Map<String, Integer> labelKeyCount = new HashMap<>();
        int blankCount = 0;
        for (DeviceEntity entity : entities) {
            String labelKey = entity.getLabelKey();
            if (labelKey == null || labelKey.isBlank()) {
                blankCount += 1;
                continue;
            }
            labelKeyCount.merge(labelKey, 1, Integer::sum);
        }
        if (blankCount > 0) {
            log.warn("{}={} {}={} {}={} {}={} {}={} blankCount={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.service.label_key_validation",
                LogFields.RESULT, "invalid",
                LogFields.ERROR_CODE, "DEVICE_LABEL_KEY_BLANK",
                blankCount
            );
        }
        List<String> duplicateKeys = labelKeyCount.entrySet().stream()
            .filter(entry -> entry.getValue() > 1)
            .map(Map.Entry::getKey)
            .sorted()
            .toList();
        if (!duplicateKeys.isEmpty()) {
            log.warn("{}={} {}={} {}={} {}={} {}={} duplicates={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.service.label_key_validation",
                LogFields.RESULT, "invalid",
                LogFields.ERROR_CODE, "DEVICE_LABEL_KEY_DUPLICATE",
                String.join(",", duplicateKeys)
            );
        }
    }

    private TelemetryEntity latestMetric(String deviceCode) {
        QueryWrapper<TelemetryEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("device_code", deviceCode).orderByDesc("metric_time").last("LIMIT 1");
        return telemetryMapper.selectOne(wrapper);
    }

    private List<DeviceAlarmDto> recentDeviceAlarms(String deviceCode) {
        QueryWrapper<AlarmEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("device_code", deviceCode).orderByDesc("occurred_at").last("LIMIT 2");
        return alarmMapper.selectList(wrapper).stream().map(alarm -> new DeviceAlarmDto(
            alarm.getId(),
            alarm.getEvent(),
            levelToType(alarm.getLevel()),
            alarm.getOccurredAt() == null ? "--:--" : alarm.getOccurredAt().format(TIME_FMT)
        )).toList();
    }

    private BigDecimal decimal(TelemetryEntity metric, String field) {
        if (metric == null) {
            return BigDecimal.ZERO;
        }
        return switch (field) {
            case "temperature" -> metric.getTemperature();
            case "humidity" -> metric.getHumidity();
            case "voltage" -> metric.getVoltage();
            case "current" -> metric.getCurrent();
            case "power" -> metric.getPower();
            case "cpuLoad" -> metric.getCpuLoad();
            case "memoryUsage" -> metric.getMemoryUsage();
            case "diskUsage" -> metric.getDiskUsage();
            default -> metric.getNetworkTraffic();
        };
    }

    private String levelToType(Integer level) {
        if (level == null) {
            return "info";
        }
        if (level >= 3) {
            return "error";
        }
        if (level == 2) {
            return "warning";
        }
        return "info";
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            return "normal";
        }
        return switch (status) {
            case "warning", "error", "normal" -> status;
            default -> "normal";
        };
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
