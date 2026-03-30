package com.twinops.backend.alarm.controller;

import com.twinops.backend.common.dto.AlarmItemDto;
import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.alarm.service.AlarmService;
import jakarta.validation.constraints.Pattern;
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

    private final AlarmService alarmService;

    public AlarmController(AlarmService alarmService) {
        this.alarmService = alarmService;
    }

    @GetMapping
    public ApiResponse<List<AlarmItemDto>> list(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ApiResponse.ok(alarmService.listByStatus(status, limit));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<AlarmItemDto> updateStatus(@PathVariable Long id, @RequestBody AlarmStatusRequest body) {
        return ApiResponse.ok(alarmService.updateStatus(id, body.status()));
    }

    public record AlarmStatusRequest(
        @Pattern(regexp = "new|acknowledged|resolved", message = "status must be new/acknowledged/resolved")
        String status
    ) {
    }
}
