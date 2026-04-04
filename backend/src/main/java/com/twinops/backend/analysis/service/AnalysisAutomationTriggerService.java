package com.twinops.backend.analysis.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.twinops.backend.analysis.dto.AnalysisAutomationMessage;
import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.dto.TriggerAnalysisResponse;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.device.entity.DeviceEntity;
import com.twinops.backend.device.mapper.DeviceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AnalysisAutomationTriggerService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisAutomationTriggerService.class);
    private static final DateTimeFormatter SLOT_FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final String BATCH_JOB_TYPE = "analysis-batch";
    private static final String AGGREGATED_DEVICE_CODE = "AGGREGATED";

    private final DeviceMapper deviceMapper;
    private final AnalysisService analysisService;
    private final AnalysisAutomationProducer producer;

    public AnalysisAutomationTriggerService(
        DeviceMapper deviceMapper,
        AnalysisService analysisService,
        AnalysisAutomationProducer producer
    ) {
        this.deviceMapper = deviceMapper;
        this.analysisService = analysisService;
        this.producer = producer;
    }

    public TriggerAnalysisResponse triggerManualBatch() {
        String slot = "manual-" + LocalDateTime.now().withNano(0).format(SLOT_FMT);
        QueryWrapper<DeviceEntity> wrapper = new QueryWrapper<>();
        wrapper.in("status", List.of("warning", "error"));
        wrapper.orderByAsc("device_code");
        List<DeviceEntity> targets = deviceMapper.selectList(wrapper);
        int acceptedCount = 0;
        int failedCount = 0;

        log.info("{}={} {}={} {}={} {}={} slot={} targetCount={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.automation.manual.trigger",
            LogFields.RESULT, "started",
            slot,
            targets.size()
        );

        if (targets.isEmpty()) {
            log.warn("{}={} {}={} {}={} {}={} {}={} slot={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.manual.trigger",
                LogFields.RESULT, "skipped",
                LogFields.ERROR_CODE, "ANALYSIS_TARGET_EMPTY",
                slot
            );
            return new TriggerAnalysisResponse(slot, "skipped", 0, 0, 0);
        }

        Long reportId = null;
        String idempotencyKey = "batch:" + slot;
        try {
            String metricSummary = "auto-analysis slot=%s mode=aggregated targetCount=%d source=manual".formatted(
                slot,
                targets.size()
            );
            AnalysisReportDto processing = analysisService.createProcessingReport(
                AGGREGATED_DEVICE_CODE,
                metricSummary,
                idempotencyKey
            );
            reportId = processing.id();
            producer.publish(new AnalysisAutomationMessage(
                BATCH_JOB_TYPE,
                AGGREGATED_DEVICE_CODE,
                metricSummary,
                slot,
                idempotencyKey,
                reportId
            ));
            acceptedCount = 1;
        } catch (Exception ex) {
            log.error("{}={} {}={} {}={} {}={} {}={} slot={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.manual.trigger",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "ANALYSIS_TRIGGER_PUBLISH_FAILED",
                slot,
                ex.getMessage(),
                ex
            );
            failExistingReportSafely(reportId, ex.getMessage());
            failedCount = 1;
        }

        log.info("{}={} {}={} {}={} {}={} slot={} targetCount={} acceptedCount={} failedCount={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.automation.manual.trigger",
            LogFields.RESULT, failedCount == 0 ? "success" : "partial",
            slot,
            targets.size(),
            acceptedCount,
            failedCount
        );

        return new TriggerAnalysisResponse(
            slot,
            failedCount == 0 ? "processing" : (acceptedCount > 0 ? "partial" : "failed"),
            targets.size(),
            acceptedCount,
            failedCount
        );
    }

    private void failExistingReportSafely(Long reportId, String errorMessage) {
        try {
            if (reportId != null) {
                analysisService.failExistingProcessingReport(reportId, errorMessage);
            }
        } catch (Exception ex) {
            log.error("{}={} {}={} {}={} {}={} {}={} reportId={} message={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.automation.manual.mark_failed",
                LogFields.RESULT, "failed",
                LogFields.ERROR_CODE, "ANALYSIS_MARK_FAILED_ERROR",
                reportId == null ? "n/a" : reportId,
                ex.getMessage(),
                ex
            );
        }
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
