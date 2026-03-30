package com.twinops.backend.telemetry.controller;

import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.dto.TelemetryPointDto;
import com.twinops.backend.telemetry.service.TelemetryService;
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
        return ApiResponse.ok(telemetryService.query(deviceCode, from, to, limit));
    }

    @GetMapping("/retention/cleanup")
    public ApiResponse<Integer> cleanup() {
        return ApiResponse.ok(telemetryService.deleteOlderThan30Days());
    }
}
