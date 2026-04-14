package com.twinops.backend.device.controller;

import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.dto.DeviceDetailDto;
import com.twinops.backend.common.dto.SimulationDeviceDataDto;
import com.twinops.backend.common.logging.LogFields;
import com.twinops.backend.device.dto.SimulationDeviceConsistencyDto;
import com.twinops.backend.device.service.DeviceService;
import com.twinops.backend.device.service.SimulationDeviceConsistencyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private static final Logger log = LoggerFactory.getLogger(DeviceController.class);
    private final DeviceService deviceService;
    private final SimulationDeviceConsistencyService simulationDeviceConsistencyService;

    public DeviceController(
        DeviceService deviceService,
        SimulationDeviceConsistencyService simulationDeviceConsistencyService
    ) {
        this.deviceService = deviceService;
        this.simulationDeviceConsistencyService = simulationDeviceConsistencyService;
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

    @GetMapping("/{deviceCode:DEV\\d+}")
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

    @GetMapping("/simulation-data")
    public ApiResponse<List<SimulationDeviceDataDto>> simulationData() {
        log.info("{}={} {}={} {}={} {}={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "device",
            LogFields.EVENT, "device.simulation_data.request",
            LogFields.RESULT, "received"
        );
        return ApiResponse.ok(deviceService.listSimulationData());
    }

    @GetMapping("/simulation-consistency")
    public ApiResponse<SimulationDeviceConsistencyDto> simulationConsistency(
        @RequestParam(defaultValue = "true") boolean autoRepair
    ) {
        log.info("{}={} {}={} {}={} {}={} autoRepair={}",
            LogFields.REQUEST_ID, safeRequestId(),
            LogFields.MODULE, "device",
            LogFields.EVENT, "device.simulation_consistency.request",
            LogFields.RESULT, "received",
            autoRepair
        );
        return ApiResponse.ok(simulationDeviceConsistencyService.checkAndRepair(autoRepair));
    }

    private String safeRequestId() {
        String requestId = MDC.get(LogFields.REQUEST_ID);
        return requestId == null || requestId.isBlank() ? "n/a" : requestId;
    }
}
