package com.twinops.backend.alarm.controller;

import com.twinops.backend.common.dto.AlarmItemDto;
import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.alarm.service.AlarmService;
import com.twinops.backend.common.logging.LogFields;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/alarms")
public class AlarmController {

    private static final Logger log = LoggerFactory.getLogger(AlarmController.class);
    private final AlarmService alarmService;

    public AlarmController(AlarmService alarmService) {
        this.alarmService = alarmService;
    }

    @GetMapping
    public ApiResponse<List<AlarmItemDto>> list(
        @RequestParam(required = false) String deviceCode,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "20") int limit
    ) {
        log.info("{}={} {}={} {}={} {}={} deviceCode={} status={} limit={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "alarm",
            LogFields.EVENT, "alarm.list.request",
            LogFields.RESULT, "received",
            deviceCode == null || deviceCode.isBlank() ? "-" : deviceCode,
            status == null || status.isBlank() ? "-" : status,
            limit
        );
        if (deviceCode != null && !deviceCode.isBlank()) {
            return ApiResponse.ok(alarmService.listByDeviceAndStatus(deviceCode, status, limit));
        }
        return ApiResponse.ok(alarmService.listByStatus(status, limit));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<AlarmItemDto> updateStatus(@PathVariable Long id, @Valid @RequestBody AlarmStatusRequest body) {
        log.info("{}={} {}={} {}={} {}={} id={} status={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "alarm",
            LogFields.EVENT, "alarm.status.update.request",
            LogFields.RESULT, "received",
            id,
            body == null ? "null" : body.status()
        );
        return ApiResponse.ok(alarmService.updateStatus(id, body.status()));
    }

    public record AlarmStatusRequest(
        @Pattern(regexp = "new|resolved", message = "status must be new/resolved")
        String status
    ) {
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
