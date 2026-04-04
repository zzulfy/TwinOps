package com.twinops.backend.analysis.controller;

import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.dto.CreateAnalysisRequest;
import com.twinops.backend.analysis.dto.TriggerAnalysisResponse;
import com.twinops.backend.analysis.service.AnalysisAutomationTriggerService;
import com.twinops.backend.analysis.service.AnalysisAutomationProducer;
import com.twinops.backend.analysis.service.AnalysisService;
import com.twinops.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
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

    private final AnalysisService analysisService;
    private final AnalysisAutomationProducer analysisAutomationProducer;
    private final AnalysisAutomationTriggerService analysisAutomationTriggerService;

    public AnalysisController(
        AnalysisService analysisService,
        AnalysisAutomationProducer analysisAutomationProducer,
        AnalysisAutomationTriggerService analysisAutomationTriggerService
    ) {
        this.analysisService = analysisService;
        this.analysisAutomationProducer = analysisAutomationProducer;
        this.analysisAutomationTriggerService = analysisAutomationTriggerService;
    }

    @PostMapping("/reports")
    public ApiResponse<AnalysisReportDto> create(@Valid @RequestBody CreateAnalysisRequest body) {
        return ApiResponse.ok(triggerInternal(body).report());
    }

    @PostMapping("/reports/trigger")
    public ApiResponse<TriggerAnalysisResponse> trigger() {
        return ApiResponse.ok(analysisAutomationTriggerService.triggerManualBatch());
    }

    @GetMapping("/reports")
    public ApiResponse<List<AnalysisReportDto>> list(@RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.ok(analysisService.listReports(limit));
    }

    @GetMapping("/reports/{id}")
    public ApiResponse<AnalysisReportDto> detail(@PathVariable Long id) {
        return ApiResponse.ok(analysisService.getReport(id));
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
}
