package com.twinops.backend.alarm.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.AlarmItemDto;
import com.twinops.backend.common.exception.NotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AlarmService {

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
        QueryWrapper<AlarmEntity> wrapper = new QueryWrapper<>();
        if (status != null && !status.isBlank()) {
            wrapper.eq("status", status);
        }
        wrapper.orderByDesc("occurred_at").last("LIMIT " + limit);
        return alarmMapper.selectList(wrapper).stream().map(this::toDto).toList();
    }

    public AlarmItemDto updateStatus(Long id, String status) {
        AlarmEntity entity = alarmMapper.selectById(id);
        if (entity == null) {
            throw new NotFoundException("alarm not found: " + id);
        }
        entity.setStatus(status);
        if ("acknowledged".equals(status) && entity.getAcknowledgedAt() == null) {
            entity.setAcknowledgedAt(LocalDateTime.now());
        }
        if ("resolved".equals(status) && entity.getResolvedAt() == null) {
            entity.setResolvedAt(LocalDateTime.now());
        }
        alarmMapper.updateById(entity);
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
}
