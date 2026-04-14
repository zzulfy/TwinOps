package com.twinops.backend.device.controller;

import com.twinops.backend.common.dto.DeviceAlarmDto;
import com.twinops.backend.common.dto.DeviceDetailDto;
import com.twinops.backend.common.dto.SimulationDeviceDataDto;
import com.twinops.backend.auth.dto.AdminIdentityDto;
import com.twinops.backend.auth.service.AdminAuthService;
import com.twinops.backend.auth.service.AuthTokenResolver;
import com.twinops.backend.device.dto.SimulationDeviceConsistencyDto;
import com.twinops.backend.device.service.DeviceService;
import com.twinops.backend.device.service.SimulationDeviceConsistencyService;
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

    @MockBean
    private SimulationDeviceConsistencyService simulationDeviceConsistencyService;

    @MockBean
    private AuthTokenResolver authTokenResolver;

    @MockBean
    private AdminAuthService adminAuthService;

    @Test
    void shouldListDevices() throws Exception {
        when(authTokenResolver.resolve(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(new AdminIdentityDto("admin", "System Administrator", "admin"));
        DeviceDetailDto dto = new DeviceDetailDto(
            "DEV001",
            "1# 服务器机柜",
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

        mockMvc.perform(get("/api/devices").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].deviceCode").value("DEV001"))
            .andExpect(jsonPath("$.data[0].name").value("1# 服务器机柜"));
    }

    @Test
    void shouldGetDeviceDetailByCode() throws Exception {
        when(authTokenResolver.resolve(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(new AdminIdentityDto("admin", "System Administrator", "admin"));
        DeviceDetailDto dto = new DeviceDetailDto(
            "DEV002",
            "2# 服务器机柜",
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

        mockMvc.perform(get("/api/devices/DEV002").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.deviceCode").value("DEV002"))
            .andExpect(jsonPath("$.data.status").value("warning"));
    }

    @Test
    void shouldListSimulationDataWithoutUiFields() throws Exception {
        when(authTokenResolver.resolve(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(new AdminIdentityDto("admin", "System Administrator", "admin"));
        SimulationDeviceDataDto dto = new SimulationDeviceDataDto(
            "DEV003",
            "服务器机柜",
            "error",
            "SN000051",
            "数据中心 A 区 1 排",
            new BigDecimal("31.2"),
            new BigDecimal("54.0"),
            new BigDecimal("219.5"),
            new BigDecimal("7.1"),
            new BigDecimal("1550.0"),
            new BigDecimal("68.0"),
            new BigDecimal("63.0"),
            new BigDecimal("52.0"),
            new BigDecimal("220.0"),
            List.of(new DeviceAlarmDto(2L, "过载", "error", "08:31"))
        );

        when(deviceService.listSimulationData()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/devices/simulation-data").header("Authorization", "Bearer token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].deviceCode").value("DEV003"))
            .andExpect(jsonPath("$.data[0].status").value("error"))
            .andExpect(jsonPath("$.data[0].name").doesNotExist())
            .andExpect(jsonPath("$.data[0].labelKey").doesNotExist());
    }

    @Test
    void shouldReturnSimulationConsistencyReport() throws Exception {
        when(authTokenResolver.resolve(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn("token");
        when(adminAuthService.getIdentityByToken("token")).thenReturn(new AdminIdentityDto("admin", "System Administrator", "admin"));
        when(simulationDeviceConsistencyService.checkAndRepair(true)).thenReturn(new SimulationDeviceConsistencyDto(
            "repaired",
            true,
            true,
            51,
            49,
            51,
            0,
            2,
            List.of(),
            List.of(),
            List.of(),
            "simulation-device consistency repaired successfully"
        ));

        mockMvc.perform(get("/api/devices/simulation-consistency")
                .header("Authorization", "Bearer token")
                .queryParam("autoRepair", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").value("repaired"))
            .andExpect(jsonPath("$.data.consistent").value(true))
            .andExpect(jsonPath("$.data.addedCount").value(2));
    }
}
