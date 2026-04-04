package com.twinops.backend.device.controller;

import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.dto.DeviceDetailDto;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.device.service.DeviceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private static final Logger log = LoggerFactory.getLogger(DeviceController.class);
    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping
    public ApiResponse<List<DeviceDetailDto>> list() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "device",
            LogFields.EVENT, "device.list.request",
            LogFields.RESULT, "received"
        );
        return ApiResponse.ok(deviceService.list());
    }

    @GetMapping("/{deviceCode}")
    public ApiResponse<DeviceDetailDto> detail(@PathVariable String deviceCode) {
        if (deviceCode == null || deviceCode.isBlank()) {
            log.warn("{}={} {}={} {}={} {}={} {}={}",
                LogFields.REQUEST_ID, safeRequestId(),
                LogFields.MODULE, "device",
                LogFields.EVENT, "device.detail.request",
                LogFields.RESULT, "invalid",
                LogFields.ERROR_CODE, "DEVICE_CODE_BLANK"
            );
        }
        log.info("{}={} {}={} {}={} {}={} deviceCode={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "device",
            LogFields.EVENT, "device.detail.request",
            LogFields.RESULT, "received",
            deviceCode
        );
        return ApiResponse.ok(deviceService.getByDeviceCode(deviceCode));
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
