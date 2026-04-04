package com.twinops.backend.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import com.twinops.backend.common.logging.LogFields;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "twinops.analysis.automation", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AnalysisAutomationConsumer {

    private static final Logger log = LoggerFactory.getLogger(AnalysisAutomationConsumer.class);
    private static final String BATCH_JOB_TYPE = "analysis-batch";

    private final AnalysisService analysisService;
    private final AnalysisAggregationService analysisAggregationService;
    private final ObjectMapper objectMapper;
    private final String topic;

    public AnalysisAutomationConsumer(
        AnalysisService analysisService,
        AnalysisAggregationService analysisAggregationService,
        @Value("${twinops.analysis.automation.topic:analysis.request}") String topic
    ) {
        this.analysisService = analysisService;
        this.analysisAggregationService = analysisAggregationService;
        this.objectMapper = new ObjectMapper();
        this.topic = topic;
    }

    @KafkaListener(
        topics = "${twinops.analysis.automation.topic:analysis.request}",
        groupId = "${twinops.analysis.automation.consumer-group:twinops-analysis-consumer}"
    )
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
            if (BATCH_JOB_TYPE.equals(message.jobType())) {
                analysisAggregationService.processAggregatedBatch(message.slot(), message.idempotencyKey());
            } else {
                analysisService.createReportWithIdempotency(message.deviceCode(), message.metricSummary(), message.idempotencyKey());
            }
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
