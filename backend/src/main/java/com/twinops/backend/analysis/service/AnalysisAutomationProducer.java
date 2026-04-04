package com.twinops.backend.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import com.twinops.backend.common.logging.LogFields;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "twinops.analysis.automation", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AnalysisAutomationProducer {

    private static final Logger log = LoggerFactory.getLogger(AnalysisAutomationProducer.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String topic;

    public AnalysisAutomationProducer(
        KafkaTemplate<String, String> kafkaTemplate,
        @Value("${twinops.analysis.automation.topic:analysis.request}") String topic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = new ObjectMapper();
        this.topic = topic;
    }

    public void publish(AnalysisAutomationMessage message) {
        try {
            String payload = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(new ProducerRecord<>(topic, message.idempotencyKey(), payload));
            log.info("{}={} {}={} {}={} {}={} topic={} deviceCode={} idempotencyKey={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.publish",
                LogFields.RESULT, "success",
                topic,
                message.deviceCode(),
                message.idempotencyKey()
            );
        } catch (Exception ex) {
            log.error("{}={} {}={} {}={} {}={} {}={} topic={} deviceCode={} idempotencyKey={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.publish",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "ANALYSIS_PUBLISH_FAILED",
                topic,
                message.deviceCode(),
                message.idempotencyKey(),
                ex.getMessage(),
                ex
            );
            throw new RuntimeException("analysis automation publish failed", ex);
        }
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
