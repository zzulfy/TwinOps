package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalysisAutomationSchedulerTest {

    @Mock
    private DeviceMapper deviceMapper;

    @Mock
    private AnalysisAutomationProducer producer;

    private AnalysisAutomationScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new AnalysisAutomationScheduler(deviceMapper, producer, "analysis.request");
    }

    @Test
    void shouldPublishForWarningAndErrorDevicesWithIdempotencyKey() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(
            device("DEV001", "warning", "A1"),
            device("DEV002", "error", "B1")
        ));

        scheduler.publishHalfDayBatch();

        ArgumentCaptor<AnalysisAutomationMessage> messageCaptor = ArgumentCaptor.forClass(AnalysisAutomationMessage.class);
        verify(producer, org.mockito.Mockito.times(2)).publish(messageCaptor.capture());
        List<AnalysisAutomationMessage> messages = messageCaptor.getAllValues();

        assertEquals("DEV001", messages.get(0).deviceCode());
        assertTrue(messages.get(0).idempotencyKey().startsWith("DEV001:"));
        assertEquals("DEV002", messages.get(1).deviceCode());
        assertTrue(messages.get(1).idempotencyKey().startsWith("DEV002:"));
    }

    private static DeviceEntity device(String code, String status, String location) {
        DeviceEntity entity = new DeviceEntity();
        entity.setDeviceCode(code);
        entity.setStatus(status);
        entity.setLocation(location);
        return entity;
    }
}

