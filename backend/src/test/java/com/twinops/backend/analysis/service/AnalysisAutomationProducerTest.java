package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AnalysisAutomationProducerTest {

    @Mock
    private RocketMQTemplate rocketMQTemplate;

    private AnalysisAutomationProducer producer;

    @BeforeEach
    void setUp() {
        producer = new AnalysisAutomationProducer(rocketMQTemplate, "analysis.request");
    }

    @Test
    void shouldPublishMessageToConfiguredTopic() {
        AnalysisAutomationMessage message = new AnalysisAutomationMessage(
            "DEV001", "cpu=90", "2026040312", "DEV001:2026040312"
        );

        producer.publish(message);

        ArgumentCaptor<String> payloadCaptor = ArgumentCaptor.forClass(String.class);
        verify(rocketMQTemplate).convertAndSend(org.mockito.ArgumentMatchers.eq("analysis.request"), payloadCaptor.capture());
        String payload = payloadCaptor.getValue();
        assertTrue(payload.contains("\"deviceCode\":\"DEV001\""));
        assertTrue(payload.contains("\"metricSummary\":\"cpu=90\""));
        assertTrue(payload.contains("\"slot\":\"2026040312\""));
        assertTrue(payload.contains("\"idempotencyKey\":\"DEV001:2026040312\""));
    }

    @Test
    void shouldThrowRuntimeExceptionWhenPublishFails() {
        doThrow(new RuntimeException("mq down"))
            .when(rocketMQTemplate).convertAndSend(org.mockito.ArgumentMatchers.eq("analysis.request"), anyString());
        AnalysisAutomationMessage message = new AnalysisAutomationMessage(
            "DEV001", "cpu=90", "2026040312", "DEV001:2026040312"
        );

        assertThrows(RuntimeException.class, () -> producer.publish(message));
    }
}

