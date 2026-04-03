package com.twinops.backend.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import com.twinops.backend.common.logging.LogFields;
import org.apache.rocketmq.spring.annotation.MessageModel;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "twinops.analysis.automation", name = "enabled", havingValue = "true", matchIfMissing = true)
@RocketMQMessageListener(
    topic = "${twinops.analysis.automation.topic:analysis.request}",
    consumerGroup = "${twinops.analysis.automation.consumer-group:twinops-analysis-consumer}",
    messageModel = MessageModel.CLUSTERING
)
public class AnalysisAutomationConsumer implements RocketMQListener<String> {

    private static final Logger log = LoggerFactory.getLogger(AnalysisAutomationConsumer.class);

    private final AnalysisService analysisService;
    private final ObjectMapper objectMapper;
    private final String topic;

    public AnalysisAutomationConsumer(
        AnalysisService analysisService,
        @Value("${twinops.analysis.automation.topic:analysis.request}") String topic
    ) {
        this.analysisService = analysisService;
        this.objectMapper = new ObjectMapper();
        this.topic = topic;
    }

    @Override
    public void onMessage(String payload) {
        try {
            AnalysisAutomationMessage message = objectMapper.readValue(payload, AnalysisAutomationMessage.class);
            log.info("{}={} {}={} {}={} {}={} topic={} deviceCode={} idempotencyKey={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.consume",
                LogFields.RESULT, "started",
                topic,
                message.deviceCode(),
                message.idempotencyKey()
            );
            analysisService.createReportWithIdempotency(message.deviceCode(), message.metricSummary(), message.idempotencyKey());
            log.info("{}={} {}={} {}={} {}={} topic={} deviceCode={} idempotencyKey={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.consume",
                LogFields.RESULT, "success",
                topic,
                message.deviceCode(),
                message.idempotencyKey()
            );
        } catch (Exception ex) {
            log.error("{}={} {}={} {}={} {}={} {}={} topic={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.consume",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "ANALYSIS_CONSUME_FAILED",
                topic,
                ex.getMessage(),
                ex
            );
            throw new RuntimeException("analysis automation consume failed", ex);
        }
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
