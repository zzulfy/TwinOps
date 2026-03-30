package com.twinops.backend.device.controller;

import com.twinops.backend.common.dto.ApiResponse;
import com.twinops.backend.common.dto.DeviceDetailDto;
import com.twinops.backend.device.service.DeviceService;
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

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping
    public ApiResponse<List<DeviceDetailDto>> list() {
        return ApiResponse.ok(deviceService.list());
    }

    @GetMapping("/{deviceCode}")
    public ApiResponse<DeviceDetailDto> detail(@PathVariable String deviceCode) {
        return ApiResponse.ok(deviceService.getByDeviceCode(deviceCode));
    }
}
