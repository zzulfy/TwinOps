package com.twinops.backend.analysis.service;

import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AnalysisAutomationProducerTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    private AnalysisAutomationProducer producer;

    @BeforeEach
    void setUp() {
        producer = new AnalysisAutomationProducer(kafkaTemplate, "analysis.request");
    }

    @Test
    void shouldPublishMessageToConfiguredTopic() {
        AnalysisAutomationMessage message = new AnalysisAutomationMessage(
            "analysis-single", "DEV001", "cpu=90", "2026040312", "DEV001:2026040312", 11L
        );

        producer.publish(message);

        ArgumentCaptor<ProducerRecord<String, String>> recordCaptor = ArgumentCaptor.forClass(ProducerRecord.class);
        verify(kafkaTemplate).send(recordCaptor.capture());
        assertEquals("analysis.request", recordCaptor.getValue().topic());
        assertEquals("DEV001:2026040312", recordCaptor.getValue().key());
        String payload = recordCaptor.getValue().value();
        assertTrue(payload.contains("\"deviceCode\":\"DEV001\""));
        assertTrue(payload.contains("\"jobType\":\"analysis-single\""));
        assertTrue(payload.contains("\"metricSummary\":\"cpu=90\""));
        assertTrue(payload.contains("\"slot\":\"2026040312\""));
        assertTrue(payload.contains("\"idempotencyKey\":\"DEV001:2026040312\""));
        assertTrue(payload.contains("\"reportId\":11"));
    }

    @Test
    void shouldThrowRuntimeExceptionWhenPublishFails() {
        doThrow(new RuntimeException("mq down"))
            .when(kafkaTemplate).send(org.mockito.ArgumentMatchers.any(ProducerRecord.class));
        AnalysisAutomationMessage message = new AnalysisAutomationMessage(
            "analysis-single", "DEV001", "cpu=90", "2026040312", "DEV001:2026040312", 11L
        );

        assertThrows(RuntimeException.class, () -> producer.publish(message));
    }

    @Test
    void shouldPublishExactlyOneKafkaRecordPerTriggerRequest() {
        AnalysisAutomationMessage message = new AnalysisAutomationMessage(
            "analysis-batch", "AGGREGATED", "batch", "manual-2026040312", "batch:manual-2026040312", 15L
        );

        producer.publish(message);

        verify(kafkaTemplate, times(1)).send(org.mockito.ArgumentMatchers.any(ProducerRecord.class));
    }
}

