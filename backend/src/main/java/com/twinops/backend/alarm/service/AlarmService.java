package com.twinops.backend.alarm.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.AlarmItemDto;
import com.twinops.backend.common.exception.NotFoundException;
import com.twinops.backend.common.logging.LogFields;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AlarmService {

    private static final Logger log = LoggerFactory.getLogger(AlarmService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private final AlarmMapper alarmMapper;

    public AlarmService(AlarmMapper alarmMapper) {
        this.alarmMapper = alarmMapper;
    }

    public List<AlarmItemDto> listRecent(int limit) {
        QueryWrapper<AlarmEntity> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("occurred_at").last("LIMIT " + limit);
        return alarmMapper.selectList(wrapper).stream().map(this::toDto).toList();
    }

    public List<AlarmItemDto> listByStatus(String status, int limit) {
        log.info("{}={} {}={} {}={} {}={} status={} limit={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "alarm",
            LogFields.EVENT, "alarm.service.list_by_status",
            LogFields.RESULT, "started",
            status == null || status.isBlank() ? "-" : status,
            limit
        );
        QueryWrapper<AlarmEntity> wrapper = new QueryWrapper<>();
        if (status != null && !status.isBlank()) {
            wrapper.eq("status", status);
        }
        wrapper.orderByDesc("occurred_at").last("LIMIT " + limit);
        return alarmMapper.selectList(wrapper).stream().map(this::toDto).toList();
    }

    public List<AlarmItemDto> listByDeviceAndStatus(String deviceCode, String status, int limit) {
        log.info("{}={} {}={} {}={} {}={} deviceCode={} status={} limit={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "alarm",
            LogFields.EVENT, "alarm.service.list_by_device_status",
            LogFields.RESULT, "started",
            deviceCode,
            status == null || status.isBlank() ? "-" : status,
            limit
        );
        QueryWrapper<AlarmEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("device_code", deviceCode);
        if (status != null && !status.isBlank()) {
            wrapper.eq("status", status);
        }
        wrapper.orderByDesc("occurred_at").last("LIMIT " + limit);
        return alarmMapper.selectList(wrapper).stream().map(this::toDto).toList();
    }

    public AlarmItemDto updateStatus(Long id, String status) {
        if (!"new".equals(status) && !"resolved".equals(status)) {
            log.warn("{}={} {}={} {}={} {}={} {}={} alarmId={} status={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "alarm",
                LogFields.EVENT, "alarm.service.update_status",
                LogFields.RESULT, "invalid",
                LogFields.ERROR_CODE, "ALARM_STATUS_INVALID",
                id,
                status
            );
            throw new IllegalArgumentException("status must be new/resolved");
        }
        AlarmEntity entity = alarmMapper.selectById(id);
        if (entity == null) {
            log.error("{}={} {}={} {}={} {}={} {}={} alarmId={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "alarm",
                LogFields.EVENT, "alarm.service.update_status",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "ALARM_NOT_FOUND",
                id
            );
            throw new NotFoundException("alarm not found: " + id);
        }
        entity.setStatus(status);
        if ("resolved".equals(status) && entity.getResolvedAt() == null) {
            entity.setResolvedAt(LocalDateTime.now());
        }
        alarmMapper.updateById(entity);
        log.info("{}={} {}={} {}={} {}={} alarmId={} status={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "alarm",
            LogFields.EVENT, "alarm.service.update_status",
            LogFields.RESULT, "success",
            id,
            status
        );
        return toDto(entity);
    }

    private AlarmItemDto toDto(AlarmEntity entity) {
        String time = entity.getOccurredAt() == null ? "--:--" : entity.getOccurredAt().format(TIME_FMT);
        return new AlarmItemDto(
            entity.getId(),
            entity.getDeviceName(),
            entity.getEvent(),
            entity.getLevel(),
            time,
            entity.getStatus()
        );
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
