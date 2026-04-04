package com.twinops.backend.dashboard.controller;

import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.dto.DashboardSummaryDto;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.dashboard.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryDto> summary() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "dashboard",
            LogFields.EVENT, "dashboard.summary.request",
            LogFields.RESULT, "received"
        );
        DashboardSummaryDto summary = dashboardService.summary();
        if (summary.alarms() == null || summary.alarms().isEmpty()) {
            log.warn("{}={} {}={} {}={} {}={} {}={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "dashboard",
                LogFields.EVENT, "dashboard.summary.result",
                LogFields.RESULT, "empty",
                LogFields.ERROR_CODE, "DASHBOARD_ALARMS_EMPTY"
            );
        }
        return ApiResponse.ok(summary);
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
