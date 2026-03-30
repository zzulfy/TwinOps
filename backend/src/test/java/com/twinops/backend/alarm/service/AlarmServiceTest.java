package com.twinops.backend.alarm.service;

import com.twinops.backend.alarm.entity.AlarmEntity;
import com.twinops.backend.alarm.mapper.AlarmMapper;
import com.twinops.backend.common.dto.AlarmItemDto;
import com.twinops.backend.common.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlarmServiceTest {

    @Mock
    private AlarmMapper alarmMapper;

    private AlarmService alarmService;

    @BeforeEach
    void setUp() {
        alarmService = new AlarmService(alarmMapper);
    }

    @Test
    void shouldMapListByStatusWithFormattedTimeAndFallback() {
        AlarmEntity alarm1 = alarm(1L, "1# 服务器机柜", "温度过高", 3, "new", LocalDateTime.of(2026, 3, 30, 8, 21));
        AlarmEntity alarm2 = alarm(2L, "2# 网络设备", "网络波动", 1, "new", null);

        when(alarmMapper.selectList(any())).thenReturn(List.of(alarm1, alarm2));

        List<AlarmItemDto> result = alarmService.listByStatus("new", 20);

        assertEquals(2, result.size());
        assertEquals("08:21", result.get(0).time());
        assertEquals("--:--", result.get(1).time());
        assertEquals("1# 服务器机柜", result.get(0).name());
        assertEquals("new", result.get(0).status());
    }

    @Test
    void shouldSetAcknowledgedTimestampWhenUpdatingStatus() {
        AlarmEntity entity = alarm(3L, "3# 电源柜", "电压波动", 2, "new", LocalDateTime.of(2026, 3, 30, 9, 0));
        entity.setAcknowledgedAt(null);

        when(alarmMapper.selectById(3L)).thenReturn(entity);

        AlarmItemDto dto = alarmService.updateStatus(3L, "acknowledged");

        assertEquals("acknowledged", dto.status());
        assertNotNull(entity.getAcknowledgedAt());
        verify(alarmMapper).updateById(entity);
    }

    @Test
    void shouldSetResolvedTimestampWhenUpdatingStatus() {
        AlarmEntity entity = alarm(4L, "4# 电源柜", "电流过高", 2, "acknowledged", LocalDateTime.of(2026, 3, 30, 9, 5));
        entity.setResolvedAt(null);

        when(alarmMapper.selectById(4L)).thenReturn(entity);

        AlarmItemDto dto = alarmService.updateStatus(4L, "resolved");

        assertEquals("resolved", dto.status());
        assertNotNull(entity.getResolvedAt());
        verify(alarmMapper).updateById(entity);
    }

    @Test
    void shouldThrowWhenAlarmNotFound() {
        when(alarmMapper.selectById(999L)).thenReturn(null);

        NotFoundException ex = assertThrows(NotFoundException.class,
            () -> alarmService.updateStatus(999L, "resolved"));

        assertEquals("alarm not found: 999", ex.getMessage());
    }

    private static AlarmEntity alarm(
        Long id,
        String deviceName,
        String event,
        Integer level,
        String status,
        LocalDateTime occurredAt
    ) {
        AlarmEntity entity = new AlarmEntity();
        entity.setId(id);
        entity.setDeviceName(deviceName);
        entity.setEvent(event);
        entity.setLevel(level);
        entity.setStatus(status);
        entity.setOccurredAt(occurredAt);
        return entity;
    }
}
