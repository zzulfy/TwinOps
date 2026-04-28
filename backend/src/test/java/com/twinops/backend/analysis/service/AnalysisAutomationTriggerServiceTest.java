package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.dto.TriggerAnalysisResponse;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalysisAutomationTriggerServiceTest {

    @Mock
    private DeviceMapper deviceMapper;
    @Mock
    private AnalysisService analysisService;
    @Mock
    private AnalysisAutomationProducer producer;

    private AnalysisAutomationTriggerService triggerService;

    @BeforeEach
    void setUp() {
        triggerService = new AnalysisAutomationTriggerService(deviceMapper, analysisService, producer);
    }

    @Test
    void shouldCreateSingleProcessingReportAndPublishSingleKafkaWorkload() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(
            device("DEV001", "warning", "A1"),
            device("DEV002", "error", "B1")
        ));
        when(analysisService.createProcessingReport(eq("AGGREGATED"), any(), any()))
            .thenReturn(new AnalysisReportDto(11L, "AGGREGATED", "x", null, null, null, null, null, null, java.util.List.of(), java.util.List.of(), null, null, null, "processing", null, "2026-04-03 12:00:00"));

        TriggerAnalysisResponse response = triggerService.triggerManualBatch();

        assertEquals(2, response.targetCount());
        assertEquals(1, response.acceptedCount());
        assertEquals(0, response.failedCount());
        assertEquals("processing", response.status());
        assertTrue(response.triggerId().startsWith("manual-"));

        ArgumentCaptor<String> metricCaptor = ArgumentCaptor.forClass(String.class);
        verify(analysisService, times(1)).createProcessingReport(eq("AGGREGATED"), metricCaptor.capture(), any());
        assertTrue(metricCaptor.getValue().contains("mode=aggregated"));
        assertTrue(metricCaptor.getValue().contains("targetCount=2"));

        ArgumentCaptor<com.twinops.backend.analysis.dto.AnalysisAutomationMessage> messageCaptor =
            ArgumentCaptor.forClass(com.twinops.backend.analysis.dto.AnalysisAutomationMessage.class);
        verify(producer, times(1)).publish(messageCaptor.capture());
        assertEquals("analysis-batch", messageCaptor.getValue().jobType());
        assertEquals("AGGREGATED", messageCaptor.getValue().deviceCode());
        assertTrue(messageCaptor.getValue().idempotencyKey().startsWith("batch:manual-"));
    }

    @Test
    void shouldMarkReportFailedWhenPublishFails() {
        when(deviceMapper.selectList(any())).thenReturn(List.of(device("DEV001", "warning", "A1")));
        when(analysisService.createProcessingReport(eq("AGGREGATED"), any(), any()))
            .thenReturn(new AnalysisReportDto(21L, "AGGREGATED", "x", null, null, null, null, null, null, java.util.List.of(), java.util.List.of(), null, null, null, "processing", null, "2026-04-03 12:00:00"));
        doThrow(new RuntimeException("mq down")).when(producer).publish(any());

        TriggerAnalysisResponse response = triggerService.triggerManualBatch();

        assertEquals(1, response.targetCount());
        assertEquals(0, response.acceptedCount());
        assertEquals(1, response.failedCount());
        assertEquals("failed", response.status());
        verify(analysisService).failExistingProcessingReport(eq(21L), eq("mq down"));
    }

    @Test
    void shouldSkipWhenNoTargetDevices() {
        when(deviceMapper.selectList(any())).thenReturn(List.of());

        TriggerAnalysisResponse response = triggerService.triggerManualBatch();

        assertEquals(0, response.targetCount());
        assertEquals(0, response.acceptedCount());
        assertEquals(0, response.failedCount());
        assertEquals("skipped", response.status());
        verify(analysisService, times(0)).createProcessingReport(any(), any(), any());
        verify(producer, times(0)).publish(any());
    }

    private static DeviceEntity device(String code, String status, String location) {
        DeviceEntity entity = new DeviceEntity();
        entity.setDeviceCode(code);
        entity.setStatus(status);
        entity.setLocation(location);
        return entity;
    }

}
