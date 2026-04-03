package com.twinops.backend.analysis.controller;

import com.twinops.backend.analysis.dto.AnalysisReportDto;
import com.twinops.backend.analysis.dto.CreateAnalysisRequest;
import com.twinops.backend.analysis.service.AnalysisService;
import com.twinops.backend.auth.service.AdminAuthGuard;
import com.twinops.backend.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
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
    private final AdminAuthGuard adminAuthGuard;

    public AnalysisController(AnalysisService analysisService, AdminAuthGuard adminAuthGuard) {
        this.analysisService = analysisService;
        this.adminAuthGuard = adminAuthGuard;
    }

    @PostMapping("/reports")
    public ApiResponse<AnalysisReportDto> create(
        @Valid @RequestBody CreateAnalysisRequest body,
        HttpServletRequest request
    ) {
        adminAuthGuard.requireAdmin(request);
        return ApiResponse.ok(analysisService.createReport(body.deviceCode(), body.metricSummary()));
    }

    @GetMapping("/reports")
    public ApiResponse<List<AnalysisReportDto>> list(
        @RequestParam(defaultValue = "20") int limit,
        HttpServletRequest request
    ) {
        adminAuthGuard.requireAdmin(request);
        return ApiResponse.ok(analysisService.listReports(limit));
    }

    @GetMapping("/reports/{id}")
    public ApiResponse<AnalysisReportDto> detail(@PathVariable Long id, HttpServletRequest request) {
        adminAuthGuard.requireAdmin(request);
        return ApiResponse.ok(analysisService.getReport(id));
    }
}
