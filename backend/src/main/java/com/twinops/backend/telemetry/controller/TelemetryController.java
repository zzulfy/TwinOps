package com.twinops.backend.telemetry.controller;

import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.dto.TelemetryPointDto;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.telemetry.service.TelemetryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    private static final Logger log = LoggerFactory.getLogger(TelemetryController.class);
    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping
    public ApiResponse<List<TelemetryPointDto>> query(
        @RequestParam(required = false) String deviceCode,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
        @RequestParam(defaultValue = "120") int limit
    ) {
        if (limit <= 0) {
            log.warn("{}={} {}={} {}={} {}={} {}={} limit={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "telemetry",
                LogFields.EVENT, "telemetry.query.request",
                LogFields.RESULT, "invalid",
                LogFields.ERROR_CODE, "TELEMETRY_LIMIT_INVALID",
                limit
            );
        }
        log.info("{}={} {}={} {}={} {}={} deviceCode={} limit={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "telemetry",
            LogFields.EVENT, "telemetry.query.request",
            LogFields.RESULT, "received",
            deviceCode == null || deviceCode.isBlank() ? "-" : deviceCode,
            limit
        );
        return ApiResponse.ok(telemetryService.query(deviceCode, from, to, limit));
    }

    @GetMapping("/retention/cleanup")
    public ApiResponse<Integer> cleanup() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "telemetry",
            LogFields.EVENT, "telemetry.retention.cleanup.request",
            LogFields.RESULT, "received"
        );
        return ApiResponse.ok(telemetryService.deleteOlderThan30Days());
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
