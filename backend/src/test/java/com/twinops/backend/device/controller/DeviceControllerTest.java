package com.twinops.backend.device.controller;

import com.twinops.backend.common.dto.DeviceAlarmDto;
import com.twinops.backend.common.dto.DeviceDetailDto;
import com.twinops.backend.device.service.DeviceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeviceController.class)
class DeviceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DeviceService deviceService;

    @Test
    void shouldListDevices() throws Exception {
        DeviceDetailDto dto = new DeviceDetailDto(
            "DEV001",
            "1# 服务器机柜",
            "服务器机柜",
            "normal",
            "SN000017",
            "数据中心 A 区 1 排",
            new BigDecimal("25.3"),
            new BigDecimal("50.1"),
            new BigDecimal("220.0"),
            new BigDecimal("7.0"),
            new BigDecimal("1400.0"),
            new BigDecimal("41.0"),
            new BigDecimal("52.0"),
            new BigDecimal("47.0"),
            new BigDecimal("188.0"),
            List.of(new DeviceAlarmDto(1L, "温度过高", "warning", "08:21"))
        );

        when(deviceService.list()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/devices"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].deviceCode").value("DEV001"))
            .andExpect(jsonPath("$.data[0].name").value("1# 服务器机柜"));
    }

    @Test
    void shouldGetDeviceDetailByCode() throws Exception {
        DeviceDetailDto dto = new DeviceDetailDto(
            "DEV002",
            "2# 服务器机柜",
            "服务器机柜",
            "warning",
            "SN000034",
            "数据中心 A 区 1 排",
            new BigDecimal("27.0"),
            new BigDecimal("55.0"),
            new BigDecimal("221.0"),
            new BigDecimal("6.5"),
            new BigDecimal("1500.0"),
            new BigDecimal("58.0"),
            new BigDecimal("60.0"),
            new BigDecimal("50.0"),
            new BigDecimal("210.0"),
            List.of()
        );

        when(deviceService.getByDeviceCode("DEV002")).thenReturn(dto);

        mockMvc.perform(get("/api/devices/DEV002"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.deviceCode").value("DEV002"))
            .andExpect(jsonPath("$.data.status").value("warning"));
    }
}
