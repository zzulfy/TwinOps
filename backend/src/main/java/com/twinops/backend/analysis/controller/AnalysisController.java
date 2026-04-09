package com.twinops.backend.analysis.controller;

import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.dto.AnalysisAutomationHealthDto;
import com.twinops.backend.analysis.dto.CreateAnalysisRequest;
import com.twinops.backend.analysis.dto.TriggerAnalysisResponse;
import com.twinops.backend.analysis.service.AnalysisAutomationHealthService;
import com.twinops.backend.analysis.service.AnalysisAutomationTriggerService;
import com.twinops.backend.analysis.service.AnalysisAutomationProducer;
import com.twinops.backend.analysis.service.AnalysisService;
import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.logging.LogFields;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private static final Logger log = LoggerFactory.getLogger(AnalysisController.class);
    private final AnalysisService analysisService;
    private final AnalysisAutomationProducer analysisAutomationProducer;
    private final AnalysisAutomationTriggerService analysisAutomationTriggerService;
    private final AnalysisAutomationHealthService analysisAutomationHealthService;

    public AnalysisController(
        AnalysisService analysisService,
        AnalysisAutomationProducer analysisAutomationProducer,
        AnalysisAutomationTriggerService analysisAutomationTriggerService,
        AnalysisAutomationHealthService analysisAutomationHealthService
    ) {
        this.analysisService = analysisService;
        this.analysisAutomationProducer = analysisAutomationProducer;
        this.analysisAutomationTriggerService = analysisAutomationTriggerService;
        this.analysisAutomationHealthService = analysisAutomationHealthService;
    }

    @PostMapping("/reports")
    public ApiResponse<AnalysisReportDto> create(@Valid @RequestBody CreateAnalysisRequest body) {
        log.info("{}={} {}={} {}={} {}={} deviceCode={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.report.create.request",
            LogFields.RESULT, "received",
            body.deviceCode()
        );
        return ApiResponse.ok(triggerInternal(body).report());
    }

    @PostMapping("/reports/trigger")
    public ApiResponse<TriggerAnalysisResponse> trigger() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.report.trigger.request",
            LogFields.RESULT, "received"
        );
        return ApiResponse.ok(analysisAutomationTriggerService.triggerManualBatch());
    }

    @GetMapping("/reports")
    public ApiResponse<List<AnalysisReportDto>> list(@RequestParam(defaultValue = "20") int limit) {
        if (limit <= 0) {
            log.warn("{}={} {}={} {}={} {}={} {}={} limit={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "analysis",
                LogFields.EVENT, "analysis.report.list.request",
                LogFields.RESULT, "invalid",
                LogFields.ERROR_CODE, "ANALYSIS_LIMIT_INVALID",
                limit
            );
        }
        log.info("{}={} {}={} {}={} {}={} limit={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.report.list.request",
            LogFields.RESULT, "received",
            limit
        );
        return ApiResponse.ok(analysisService.listReports(limit));
    }

    @GetMapping("/reports/{id}")
    public ApiResponse<AnalysisReportDto> detail(@PathVariable Long id) {
        log.info("{}={} {}={} {}={} {}={} reportId={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.report.detail.request",
            LogFields.RESULT, "received",
            id
        );
        return ApiResponse.ok(analysisService.getReport(id));
    }

    @GetMapping("/health")
    public ApiResponse<AnalysisAutomationHealthDto> health() {
        AnalysisAutomationHealthDto health = analysisAutomationHealthService.getHealth();
        log.info("{}={} {}={} {}={} {}={} status={} listenerRunning={} kafkaReachable={} topic={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "analysis",
            LogFields.EVENT, "analysis.automation.health.request",
            LogFields.RESULT, "success",
            health.status(),
            health.listenerRunning(),
            health.kafkaReachable(),
            health.topic()
        );
        return ApiResponse.ok(health);
    }

    private TriggerContext triggerInternal(CreateAnalysisRequest body) {
        String idempotencyKey = body.deviceCode() + ":" + System.currentTimeMillis();
        AnalysisReportDto processing = analysisService.createProcessingReport(body.deviceCode(), body.metricSummary(), idempotencyKey);
        analysisAutomationProducer.publish(
            new com.twinops.backend.analysis.dto.AnalysisAutomationMessage(
                "analysis-single",
                body.deviceCode(),
                body.metricSummary(),
                "manual",
                idempotencyKey,
                processing.id()
            )
        );
        return new TriggerContext(processing, idempotencyKey);
    }

    private record TriggerContext(AnalysisReportDto report, String idempotencyKey) {
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
